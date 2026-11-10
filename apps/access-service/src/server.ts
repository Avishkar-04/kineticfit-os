import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import { HealthProbeRegistry, createLogger, liveTurnstileSaturationGauge } from '@kineticfit/observability';
import { WebSocket } from 'ws';

const logger = createLogger('access-service');
const healthRegistry = new HealthProbeRegistry('access-service', '1.0.0');

// Floor Saturation & Occupancy State (Downtown Flagship: Cap 300)
export class FloorManager {
  public capacity = 300;
  public occupancy = 222;
  public isLockdown = false;
  public sectors = {
    freeWeights: 88,
    recoveryPlunge: 62,
    cardioDeck: 54,
    functionalTurf: 79
  };

  private wsClients = new Set<WebSocket>();

  public addClient(ws: WebSocket) {
    this.wsClients.add(ws);
    ws.on('close', () => this.wsClients.delete(ws));
    // Send immediate initial state
    ws.send(JSON.stringify({ type: 'INIT_STATE', occupancy: this.occupancy, capacity: this.capacity, sectors: this.sectors, isLockdown: this.isLockdown }));
  }

  public broadcast(event: any) {
    const payload = JSON.stringify(event);
    for (const ws of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  public processCheckIn(rfidUid: string, gateId: string = 'Lane 01 Biometric East'): {
    status: 'GRANTED' | 'DENIED';
    name?: string;
    tier?: string;
    memberId?: string;
    reason?: string;
    occupancy: number;
  } {
    if (this.isLockdown) {
      return { status: 'DENIED', reason: 'Facility Lockdown Engaged', occupancy: this.occupancy };
    }

    const rfid = rfidUid.trim().toUpperCase();

    // Known athlete roster map
    const roster: Record<string, { name: string; memberId: string; tier: string; active: boolean }> = {
      '04:A2:3F:89:C1': { name: 'Aria Sterling', memberId: 'KF-1042', tier: 'PRO', active: true },
      '04:B5:12:77:E4': { name: 'David Kim', memberId: 'KF-1088', tier: 'PRO', active: true },
      '04:C8:99:32:A0': { name: 'Liam Brooks', memberId: 'KF-1099', tier: 'STANDARD', active: true },
      '04:D1:44:66:F8': { name: 'Alex Rivera', memberId: 'KF-2012', tier: 'STANDARD', active: false }, // Lapsed
      '04:E9:00:11:99': { name: 'Marcus Vance', memberId: 'KF-0001', tier: 'ELITE_BLACK', active: true }
    };

    const athlete = roster[rfid];

    if (!athlete || !athlete.active) {
      const denial = {
        type: 'TURNSTILE_EVENT',
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        name: athlete ? athlete.name : 'Unknown Keycard',
        id: athlete ? athlete.memberId : 'UNKNOWN',
        tier: athlete ? athlete.tier : 'NONE',
        gateId,
        status: 'DENIED' as const,
        reason: athlete ? 'Membership Lapsed / Past Due' : 'Unregistered RFID UID'
      };
      this.broadcast(denial);
      return { status: 'DENIED', reason: denial.reason, occupancy: this.occupancy };
    }

    // Success check-in -> increment occupancy
    this.occupancy = Math.min(this.capacity, this.occupancy + 1);
    liveTurnstileSaturationGauge.set(this.occupancy / this.capacity);

    const event = {
      type: 'TURNSTILE_EVENT',
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      name: athlete.name,
      id: athlete.memberId,
      tier: athlete.tier,
      gateId,
      status: 'GRANTED' as const,
      occupancy: this.occupancy
    };

    this.broadcast(event);

    return {
      status: 'GRANTED',
      name: athlete.name,
      tier: athlete.tier,
      memberId: athlete.memberId,
      occupancy: this.occupancy
    };
  }
}

export const floorManager = new FloorManager();

export async function buildServer() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(fastifyWebsocket);

  // Health Probes
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

  // WebSocket Live Turnstile Stream
  app.get('/access/ws', { websocket: true }, (socket, req) => {
    floorManager.addClient(socket);
  });

  // Telemetry Snapshot
  app.get('/access/telemetry', async () => {
    return {
      occupancy: floorManager.occupancy,
      capacity: floorManager.capacity,
      saturationPercentage: Math.round((floorManager.occupancy / floorManager.capacity) * 100),
      sectors: floorManager.sectors,
      isLockdown: floorManager.isLockdown
    };
  });

  // Process RFID Check-in
  app.post('/access/checkin', async (req, reply) => {
    const body = req.body as any;
    if (!body?.rfidUid) {
      reply.status(400);
      return { error: 'Missing rfidUid' };
    }

    const result = floorManager.processCheckIn(body.rfidUid, body.gateId);
    if (result.status === 'GRANTED') {
      reply.status(200);
    } else {
      reply.status(403);
    }
    return result;
  });

  // Emergency Lockdown Trigger
  app.post('/access/lockdown', async (req, reply) => {
    const body = req.body as any;
    floorManager.isLockdown = body?.engage !== false;
    floorManager.broadcast({
      type: 'LOCKDOWN_STATE',
      isLockdown: floorManager.isLockdown,
      reason: body?.reason || 'Security Protocol Engaged'
    });
    return { isLockdown: floorManager.isLockdown };
  });

  return app;
}

if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const port = Number(process.env.ACCESS_SERVICE_PORT || 3006);
  buildServer().then((app) => {
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        logger.error('Failed to start access service', { error: err.message });
        process.exit(1);
      }
      logger.info(`Access Service online at ${address}`);
    });
  });
}

