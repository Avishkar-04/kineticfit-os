import { createLogger } from '@kineticfit/observability';

const logger = createLogger('telemetry-simulator');

const RFID_CARDS = [
  '04:A2:3F:89:C1', // Aria Sterling (PRO)
  '04:B5:12:77:E4', // David Kim (PRO)
  '04:C8:99:32:A0', // Liam Brooks (STANDARD)
  '04:D1:44:66:F8', // Alex Rivera (STANDARD - Lapsed)
  '04:E9:00:11:99'  // Marcus Vance (ELITE_BLACK)
];

const GATES = [
  'Lane 01 Biometric East',
  'Lane 02 Turnstile RFID Central',
  'Lane 03 VIP Lift Pod'
];

export function runSimulatorTick(): { rfidUid: string; gateId: string; airQualityPpm: number } {
  const cardIndex = Math.floor(Math.random() * RFID_CARDS.length);
  const gateIndex = Math.floor(Math.random() * GATES.length);
  const airQualityPpm = Math.floor(400 + Math.random() * 25);

  const payload = {
    rfidUid: RFID_CARDS[cardIndex],
    gateId: GATES[gateIndex],
    airQualityPpm
  };

  logger.info('Simulated RFID Tap Generated', payload);
  return payload;
}

export function startSimulator(intervalMs: number = 3000) {
  logger.info(`Starting KineticFit Telemetry Simulator (cadence: ${intervalMs}ms)...`);
  const timer = setInterval(async () => {
    const tick = runSimulatorTick();
    try {
      const accessPort = process.env.ACCESS_SERVICE_PORT || 3006;
      await fetch(`http://localhost:${accessPort}/access/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfidUid: tick.rfidUid, gateId: tick.gateId })
      });
    } catch {
      // Access service may be offline in dev
    }
  }, intervalMs);

  return () => clearInterval(timer);
}

if (process.argv[1]?.endsWith('simulator.js') || process.argv[1]?.endsWith('simulator.ts')) {
  startSimulator(3000);
}

