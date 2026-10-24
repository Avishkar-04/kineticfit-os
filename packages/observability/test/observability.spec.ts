import { describe, it, expect } from 'vitest';
import {
  redactObject,
  Counter,
  Gauge,
  Histogram,
  HealthProbeRegistry,
  parseTraceparent,
  formatTraceparent
} from '../src/index.js';

describe('Observability Suite', () => {
  describe('PII Redaction', () => {
    it('should recursively redact sensitive fields', () => {
      const payload = {
        name: 'Elena Rostova',
        credentials: {
          password: 'SecretPassword123!',
          keycardPin: '9988'
        },
        meta: {
          token: 'jwt.token.here',
          publicId: 'KF-1001'
        }
      };

      const redacted: any = redactObject(payload);
      expect(redacted.name).toBe('Elena Rostova');
      expect(redacted.credentials.password).toBe('[REDACTED]');
      expect(redacted.credentials.keycardPin).toBe('[REDACTED]');
      expect(redacted.meta.token).toBe('[REDACTED]');
      expect(redacted.meta.publicId).toBe('KF-1001');
    });
  });

  describe('Prometheus Metrics', () => {
    it('should record counter increments and render valid prometheus lines', () => {
      const counter = new Counter('checkin_total', 'Total gym check-ins');
      counter.inc({ hub: 'downtown', status: 'granted' });
      counter.inc({ hub: 'downtown', status: 'granted' });
      counter.inc({ hub: 'downtown', status: 'denied' });

      expect(counter.get({ hub: 'downtown', status: 'granted' })).toBe(2);
      expect(counter.get({ hub: 'downtown', status: 'denied' })).toBe(1);

      const output = counter.toPrometheus();
      expect(output).toContain('# TYPE checkin_total counter');
      expect(output).toContain('checkin_total{hub="downtown",status="granted"} 2');
    });

    it('should set gauge and render correctly', () => {
      const gauge = new Gauge('floor_occupancy', 'Live gym occupancy count');
      gauge.set(222, { hub: 'downtown' });
      expect(gauge.get({ hub: 'downtown' })).toBe(222);

      const output = gauge.toPrometheus();
      expect(output).toContain('floor_occupancy{hub="downtown"} 222');
    });
  });

  describe('Health Probes', () => {
    it('should evaluate liveness, readiness components, and draining', async () => {
      const registry = new HealthProbeRegistry('access-service', '1.0.0');

      registry.registerReadiness('postgres', async () => ({ status: 'UP' }));
      registry.registerReadiness('redis', async () => ({ status: 'UP' }));

      const live = registry.getLiveness();
      expect(live.status).toBe('UP');

      const ready = await registry.getReadiness();
      expect(ready.ok).toBe(true);
      expect(ready.result.components?.postgres.status).toBe('UP');

      // Mark draining
      registry.markDraining();
      expect(registry.getLiveness().status).toBe('DOWN');
      const drainingReady = await registry.getReadiness();
      expect(drainingReady.ok).toBe(false);
    });
  });

  describe('Distributed Tracing Context', () => {
    it('should parse and format W3C traceparent headers', () => {
      const traceHeader = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
      const parsed = parseTraceparent(traceHeader);

      expect(parsed.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
      expect(parsed.spanId).toBe('00f067aa0ba902b7');
      expect(parsed.sampled).toBe(true);

      const formatted = formatTraceparent(parsed);
      expect(formatted).toBe(traceHeader);
    });
  });
});
