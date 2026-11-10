import Fastify from 'fastify';
import cors from '@fastify/cors';
import { HealthProbeRegistry, createLogger } from '@kineticfit/observability';
import { CapacityManager } from './booking/capacity-manager.js';

const logger = createLogger('scheduling-service');
const healthRegistry = new HealthProbeRegistry('scheduling-service', '1.0.0');
const capacityManager = new CapacityManager();

// Seed initial scheduled class sessions
capacityManager.initialize([
  { id: '01931668-8000-7000-8000-000000000201', title: 'MetCon Savage Circuit', studioName: 'Studio 1 MetCon', coachName: 'Elena Rostova', startsAt: '2026-10-24T07:00:00Z', endsAt: '2026-10-24T08:00:00Z', capacity: 24, bookedCount: 24, waitlistCount: 4, version: 1 },
  { id: '01931668-8000-7000-8000-000000000202', title: 'Power Vinyasa Flow', studioName: 'Studio 2 Yoga', coachName: 'Maya Lin', startsAt: '2026-10-24T08:30:00Z', endsAt: '2026-10-24T09:30:00Z', capacity: 20, bookedCount: 18, waitlistCount: 0, version: 1 },
  { id: '01931668-8000-7000-8000-000000000203', title: 'Olympic Weightlifting Clinic', studioName: 'Studio 4 Oly Lifting', coachName: 'Jaxson Hayes', startsAt: '2026-10-24T11:00:00Z', endsAt: '2026-10-24T12:30:00Z', capacity: 12, bookedCount: 12, waitlistCount: 2, version: 1 },
  { id: '01931668-8000-7000-8000-000000000204', title: 'Rhythm Spin 45', studioName: 'Studio 3 Cycle', coachName: 'David Kim', startsAt: '2026-10-24T17:30:00Z', endsAt: '2026-10-24T18:15:00Z', capacity: 30, bookedCount: 28, waitlistCount: 0, version: 1 }
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

  // Schedule list
  app.get('/v1/schedule', async () => {
    return {
      sessions: capacityManager.getAllSessions()
    };
  });

  // Session detail
  app.get('/v1/sessions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const session = capacityManager.getSession(id);
    if (!session) {
      reply.status(404);
      return { error: 'Class session not found' };
    }
    return session;
  });

  // Reserve seat atomically
  app.post('/v1/sessions/:id/bookings', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;

    if (!body?.memberId || !body?.memberName) {
      reply.status(400);
      return { error: 'Missing memberId or memberName' };
    }

    const result = await capacityManager.reserveSeat(id, body.memberId, body.memberName);

    if (result.status === 'CONFIRMED') {
      reply.status(201);
      return result;
    } else if (result.status === 'WAITLISTED') {
      reply.status(202);
      return result;
    } else {
      reply.status(409);
      return result;
    }
  });

  // Cancel booking
  app.delete('/v1/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const outcome = await capacityManager.cancelBooking(id);
      return { success: true, outcome };
    } catch (err: any) {
      reply.status(404);
      return { error: err.message };
    }
  });

  return app;
}

if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const port = Number(process.env.SCHEDULING_SERVICE_PORT || 3003);
  buildServer().then((app) => {
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        logger.error('Failed to start scheduling service', { error: err.message });
        process.exit(1);
      }
      logger.info(`Scheduling Service online at ${address}`);
    });
  });
}

