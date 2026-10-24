import crypto from 'node:crypto';

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  responseStatus: number;
  responseBody: unknown;
  createdAt: number;
  inFlight: boolean;
}

export class IdempotencyPayloadMismatchError extends Error {
  constructor(key: string) {
    super(`Idempotency key '${key}' was previously used with a different request payload.`);
    this.name = 'IdempotencyPayloadMismatchError';
  }
}

export class IdempotencyInFlightConflictError extends Error {
  constructor(key: string) {
    super(`A request with idempotency key '${key}' is currently in-flight.`);
    this.name = 'IdempotencyInFlightConflictError';
  }
}

export class IdempotencyStore {
  private readonly store = new Map<string, IdempotencyRecord>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  public hashPayload(payload: unknown): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public begin(key: string, requestHash: string): IdempotencyRecord | null {
    const existing = this.store.get(key);
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new IdempotencyPayloadMismatchError(key);
      }
      if (existing.inFlight) {
        throw new IdempotencyInFlightConflictError(key);
      }
      return existing; // cached response available
    }

    this.store.set(key, {
      key,
      requestHash,
      responseStatus: 0,
      responseBody: null,
      createdAt: Date.now(),
      inFlight: true
    });
    return null;
  }

  public complete(key: string, status: number, body: unknown): void {
    const existing = this.store.get(key);
    if (existing) {
      existing.inFlight = false;
      existing.responseStatus = status;
      existing.responseBody = body;
    }
  }

  public rollback(key: string): void {
    this.store.delete(key);
  }
}
