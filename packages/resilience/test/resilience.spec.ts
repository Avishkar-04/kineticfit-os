import { describe, it, expect } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
  calculateFullJitter,
  RetryBudgetTracker,
  executeWithRetry,
  SlidingWindowRateLimiter,
  IdempotencyStore,
  IdempotencyPayloadMismatchError,
  isPrivateOrReservedIP
} from '../src/index.js';

describe('Resilience Suite', () => {
  describe('CircuitBreaker', () => {
    it('should transition to OPEN upon consecutive failures and use fallback', async () => {
      const breaker = new CircuitBreaker({
        name: 'test-service',
        failureThreshold: 2,
        resetTimeoutMs: 50
      });

      expect(breaker.getState()).toBe('CLOSED');

      // Failure 1
      await expect(
        breaker.execute(async () => {
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');

      expect(breaker.getState()).toBe('CLOSED');

      // Failure 2 -> should trip to OPEN
      await expect(
        breaker.execute(async () => {
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');

      expect(breaker.getState()).toBe('OPEN');

      // Subsequent call when OPEN throws CircuitBreakerOpenError
      await expect(
        breaker.execute(async () => {
          return 'ok';
        })
      ).rejects.toThrow(CircuitBreakerOpenError);

      // With fallback
      const fallbackResult = await breaker.execute(
        async () => 'ok',
        async () => 'degraded_cache'
      );
      expect(fallbackResult).toBe('degraded_cache');
    });
  });

  describe('Full Jitter Backoff', () => {
    it('should produce jitter values bounded by exponential factor', () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const jitter = calculateFullJitter(attempt, { baseMs: 100, maxMs: 1000 });
        expect(jitter).toBeGreaterThanOrEqual(0);
        expect(jitter).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe('Retry with Budget', () => {
    it('should retry transient errors and eventually succeed', async () => {
      let callCount = 0;
      const budget = new RetryBudgetTracker(0.2);

      const result = await executeWithRetry(
        async () => {
          callCount++;
          if (callCount < 3) {
            throw new Error('temporary failure');
          }
          return 'recovered';
        },
        { maxRetries: 3, baseMs: 10, maxMs: 50 },
        budget
      );

      expect(result).toBe('recovered');
      expect(callCount).toBe(3);
    });
  });

  describe('SlidingWindowRateLimiter', () => {
    it('should allow within capacity and reject excess requests', async () => {
      const limiter = new SlidingWindowRateLimiter(3, 1000);

      const r1 = await limiter.consume('client-1');
      const r2 = await limiter.consume('client-1');
      const r3 = await limiter.consume('client-1');
      const r4 = await limiter.consume('client-1');

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(true);
      expect(r4.allowed).toBe(false);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('IdempotencyStore', () => {
    it('should detect duplicate keys with differing payloads', () => {
      const store = new IdempotencyStore();
      const key = 'idem-req-123';
      const hashA = store.hashPayload({ amount: 100 });
      const hashB = store.hashPayload({ amount: 200 });

      // First call begins
      store.begin(key, hashA);
      store.complete(key, 200, { success: true });

      // Same key + different body -> throws mismatch
      expect(() => store.begin(key, hashB)).toThrow(IdempotencyPayloadMismatchError);

      // Same key + same body -> returns cached record
      const cached = store.begin(key, hashA);
      expect(cached).not.toBeNull();
      expect(cached?.responseStatus).toBe(200);
    });
  });

  describe('SSRF Protection (isPrivateOrReservedIP)', () => {
    it('should block private, loopback, and metadata ranges', () => {
      expect(isPrivateOrReservedIP('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIP('localhost')).toBe(true);
      expect(isPrivateOrReservedIP('169.254.169.254')).toBe(true); // AWS / GCP metadata
      expect(isPrivateOrReservedIP('10.0.0.5')).toBe(true);
      expect(isPrivateOrReservedIP('192.168.1.100')).toBe(true);
      expect(isPrivateOrReservedIP('172.20.0.1')).toBe(true);
      expect(isPrivateOrReservedIP('::1')).toBe(true);
    });

    it('should allow public addresses', () => {
      expect(isPrivateOrReservedIP('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIP('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIP('104.244.42.1')).toBe(false);
    });
  });
});
