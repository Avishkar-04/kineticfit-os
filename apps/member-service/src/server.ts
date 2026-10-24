import Fastify from 'fastify';
import cors from '@fastify/cors';
import { HealthProbeRegistry, createLogger } from '@kineticfit/observability';
import { MemberRegistry, MemberRecord } from './queries/member-queries.js';
import { RegistrationSagaCoordinator, SagaStep, RegistrationInput } from './sagas/registration-saga.js';

const logger = createLogger('member-service');
const healthRegistry = new HealthProbeRegistry('member-service', '1.0.0');
const registry = new MemberRegistry();

// Initialize initial seed data
registry.initialize([
  { id: '01931668-8000-7000-8000-000000000101', memberNo: 'KF-1042', name: 'Aria Sterling', email: 'aria@example.com', rfidUid: '04:A2:3F:89:C1', tier: 'PRO', status: 'ACTIVE', trainerName: 'Elena Rostova', dietPlanName: 'Hypertrophy Mass Gain', adherencePercentage: 94, joinedAt: '2025-11-12T08:00:00Z' },
  { id: '01931668-8000-7000-8000-000000000102', memberNo: 'KF-1088', name: 'David Kim', email: 'david.kim@example.com', rfidUid: '04:B5:12:77:E4', tier: 'PRO', status: 'ACTIVE', trainerName: 'Jaxson Hayes', dietPlanName: 'Fat Loss Metabolic Cut', adherencePercentage: 88, joinedAt: '2025-12-01T09:30:00Z' },
  { id: '01931668-8000-7000-8000-000000000103', memberNo: 'KF-1099', name: 'Liam Brooks', email: 'liam@example.com', rfidUid: '04:C8:99:32:A0', tier: 'STANDARD', status: 'ACTIVE', trainerName: 'Elena Rostova', dietPlanName: 'Endurance Stamina Engine', adherencePercentage: 91, joinedAt: '2026-01-15T14:20:00Z' },
  { id: '01931668-8000-7000-8000-000000000104', memberNo: 'KF-2012', name: 'Alex Rivera', email: 'alex@example.com', rfidUid: '04:D1:44:66:F8', tier: 'STANDARD', status: 'EXPIRING', trainerName: 'Maya Lin', dietPlanName: 'Keto Metabolic Flexibility', adherencePercentage: 76, joinedAt: '2025-10-20T11:00:00Z' },
  { id: '01931668-8000-7000-8000-000000000105', memberNo: 'KF-0001', name: 'Marcus Vance', email: 'director@kineticfit.dev', rfidUid: '04:E9:00:11:99', tier: 'ELITE_BLACK', status: 'ACTIVE', trainerName: 'Elena Rostova', dietPlanName: 'High-Output Performance', adherencePercentage: 98, joinedAt: '2025-08-01T07:00:00Z' }
]);

export async function buildServer() {
  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  // Standardized Health Probes
  app.get('/health/live', async () => healthRegistry.getLiveness());
  app.get('/health/ready', async (req, reply) => {
    const ready = await healthRegistry.getReadiness();
    reply.status(ready.ok ? 200 : 503);
    return ready.result;
  });
  app.get('/health/startup', async (req, reply) => {
    const startup = await healthRegistry.getStartup();
    reply.status(startup.ok ? 200 : 503);
    return startup.result;
  });

  // Query members with keyset pagination
  app.get('/v1/members', async (req) => {
    const query = req.query as any;
    return registry.query({
      search: query?.search,
      status: query?.status,
      tier: query?.tier,
      cursor: query?.cursor,
      limit: query?.limit ? Number(query.limit) : 50
    });
  });

  // Member by ID
  app.get('/v1/members/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const member = registry.findById(id);
    if (!member) {
      reply.status(404);
      return { error: 'Member not found' };
    }
    return member;
  });

  // Lookup by RFID UID for Turnstiles
  app.get('/v1/members/rfid/:uid', async (req, reply) => {
    const { uid } = req.params as { uid: string };
    const member = registry.findByRfid(uid);
    if (!member) {
      reply.status(404);
      return { error: 'Unknown RFID UID' };
    }
    return member;
  });

  // Register Athlete via Distributed Saga
  app.post('/v1/members', async (req, reply) => {
    const input = req.body as RegistrationInput;

    const saga = new RegistrationSagaCoordinator();
    const newId = crypto.randomUUID();
    const memberNo = `KF-${Math.floor(1000 + Math.random() * 9000)}`;

    const steps: SagaStep[] = [
      {
        name: 'create_auth_user',
        execute: async () => {
          logger.info(`Saga step 1: create auth user ${input.email}`);
        },
        compensate: async () => {
          logger.warn(`Saga compensation 1: disable auth user ${input.email}`);
        }
      },
      {
        name: 'bind_rfid_card',
        execute: async () => {
          const existing = registry.findByRfid(input.rfidUid);
          if (existing) {
            throw new Error(`RFID card ${input.rfidUid} already bound to another athlete`);
          }
          logger.info(`Saga step 2: RFID bound ${input.rfidUid}`);
        },
        compensate: async () => {
          logger.warn(`Saga compensation 2: release RFID card ${input.rfidUid}`);
        }
      },
      {
        name: 'persist_member_profile',
        execute: async () => {
          registry.save({
            id: newId,
            memberNo,
            name: input.name,
            email: input.email,
            rfidUid: input.rfidUid,
            tier: input.tier,
            status: 'ACTIVE',
            adherencePercentage: 100,
            joinedAt: new Date().toISOString()
          });
        },
        compensate: async () => {
          registry.remove(newId);
          logger.warn(`Saga compensation 3: purged member ${newId}`);
        }
      },
      {
        name: 'process_initial_invoice',
        execute: async () => {
          logger.info(`Saga step 4: initial subscription invoice settled`);
        },
        compensate: async () => {
          logger.warn(`Saga compensation 4: invoice marked void and refunded`);
        }
      }
    ];

    try {
      await saga.execute(steps);
      reply.status(201);
      return {
        memberId: newId,
        memberNo,
        sagaId: saga.sagaId,
        state: saga.state
      };
    } catch (err: any) {
      reply.status(422);
      return {
        error: err.message,
        sagaId: saga.sagaId,
        state: saga.state,
        compensatedSteps: saga.compensatedSteps
      };
    }
  });

  return app;
}

if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const port = Number(process.env.MEMBER_SERVICE_PORT || 3002);
  buildServer().then((app) => {
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        logger.error('Failed to start member service', { error: err.message });
        process.exit(1);
      }
      logger.info(`Member Service online at ${address}`);
    });
  });
}
