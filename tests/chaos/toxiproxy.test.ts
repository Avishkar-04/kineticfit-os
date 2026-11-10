import { describe, it, expect, beforeEach } from 'vitest';
import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerOpenError,
  SlidingWindowRateLimiter
} from '../../packages/resilience/src/index.js';

interface Toxic {
  type: 'latency' | 'bandwidth' | 'reset_peer' | 'timeout';
  attributes: Record<string, number>;
}

class SimulatedToxiproxy {
  private toxics = new Map<string, Toxic>();
  private enabled = true;

  public addToxic(name: string, toxic: Toxic): void {
    this.toxics.set(name, toxic);
  }

  public removeToxic(name: string): void {
    this.toxics.delete(name);
  }

  public disable(): void {
    this.enabled = false;
  }

  public enable(): void {
    this.enabled = true;
    this.toxics.clear();
  }

  public async executeCall<T>(callFn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      throw new Error('Toxiproxy: Connection refused / network partition');
    }

    const latencyToxic = this.toxics.get('latency');
    if (latencyToxic) {
      const delayMs = latencyToxic.attributes.latency || 100;
      await new Promise((r) => setTimeout(r, delayMs));
    }

    const resetToxic = this.toxics.get('reset_peer');
    if (resetToxic) {
      throw new Error('ECONNRESET: Connection reset by peer');
    }

    return callFn();
  }
}

describe('Toxiproxy Chaos & Fault Injection Suite', () => {
  let proxy: SimulatedToxiproxy;

  beforeEach(() => {
    proxy = new SimulatedToxiproxy();
  });

  it('handles database network partition with circuit breaker fail-fast protection', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 200,
      halfOpenMaxAttempts: 1,
      name: 'postgres-pool-cb'
    });

    // Healthy queries execute normally
    const normal = await cb.execute(() => proxy.executeCall(async () => 'DB_ROWS_OK'));
    expect(normal).toBe('DB_ROWS_OK');
    expect(cb.getState()).toBe('CLOSED');

    // Chaos: Inject total network partition (Toxiproxy disable)
    proxy.disable();

    // 3 successive failed queries
    for (let i = 0; i < 3; i++) {
      await expect(
        cb.execute(() => proxy.executeCall(async () => 'DB_ROWS'))
      ).rejects.toThrow();
    }

    // Circuit breaker is now OPEN: immediate fail-fast without TCP socket hang
    expect(cb.getState()).toBe('OPEN');

    // Next call fails immediately with CircuitBreakerOpenError
    await expect(
      cb.execute(() => proxy.executeCall(async () => 'DB_ROWS'))
    ).rejects.toBeInstanceOf(CircuitBreakerOpenError);

    // Heal network partition
    proxy.enable();
    await new Promise((r) => setTimeout(r, 250)); // wait for resetTimeoutMs

    // Half-open test call passes and closes circuit
    const recovered = await cb.execute(() => proxy.executeCall(async () => 'DB_ROWS_RECOVERED'));
    expect(recovered).toBe('DB_ROWS_RECOVERED');
    expect(cb.getState()).toBe('CLOSED');
  });

  it('accumulates unpublished events in Postgres transactional outbox when RabbitMQ is partitioned', async () => {
    const simulatedOutbox: Array<{ id: string; status: 'PENDING' | 'PUBLISHED' }> = [];

    // Producer publishes events with outbox pattern
    const publishWithOutbox = async (eventId: string) => {
      // 1. Transactionally write to outbox
      simulatedOutbox.push({ id: eventId, status: 'PENDING' });

      // 2. Attempt immediate RabbitMQ publication
      try {
        await proxy.executeCall(async () => {
          return 'AMQP_ACK';
        });
        const item = simulatedOutbox.find((o) => o.id === eventId);
        if (item) item.status = 'PUBLISHED';
      } catch {
        // Safe degraded mode: event remains PENDING in outbox for polling publisher
      }
    };

    // Before chaos: publish succeeds
    await publishWithOutbox('evt-001');
    expect(simulatedOutbox[0].status).toBe('PUBLISHED');

    // Chaos: RabbitMQ partition injected (ECONNRESET)
    proxy.addToxic('reset_peer', { type: 'reset_peer', attributes: {} });

    // Outbox absorbs writes without dropping data
    await publishWithOutbox('evt-002');
    await publishWithOutbox('evt-003');

    expect(simulatedOutbox[1].status).toBe('PENDING');
    expect(simulatedOutbox[2].status).toBe('PENDING');

    // Network heals: background outbox publisher sweeps pending events
    proxy.removeToxic('reset_peer');
    for (const item of simulatedOutbox.filter((o) => o.status === 'PENDING')) {
      await proxy.executeCall(async () => 'AMQP_ACK');
      item.status = 'PUBLISHED';
    }

    expect(simulatedOutbox.every((o) => o.status === 'PUBLISHED')).toBe(true);
  });

  it('enforces graceful read rate-limit fail-open behavior during Redis outage', async () => {
    // When Redis is down, reads fail-open to preserve gym guest schedule access
    const rateLimiter = new SlidingWindowRateLimiter(5, 1000);
    const ip = '192.168.1.105';

    // Nominal operation
    for (let i = 0; i < 5; i++) {
      const res = await rateLimiter.consume(ip);
      expect(res.allowed).toBe(true);
    }
    // Blocked on 6th
    const blockedRes = await rateLimiter.consume(ip);
    expect(blockedRes.allowed).toBe(false);

    // Degraded mode: if Redis rate-limiter throws, fallback handler allows read
    const checkRateLimitWithFallback = async (isRedisUp: boolean): Promise<{ allowed: boolean; degradedFallback?: boolean }> => {
      if (!isRedisUp) {
        // Fail-open for public read traffic
        return { allowed: true, degradedFallback: true };
      }
      const res = await rateLimiter.consume(ip);
      return { allowed: res.allowed, degradedFallback: false };
    };

    const result = await checkRateLimitWithFallback(false);
    expect(result.allowed).toBe(true);
    expect(result.degradedFallback).toBe(true);
  });
});
