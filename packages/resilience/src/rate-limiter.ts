export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
}

export interface RateLimiter {
  consume(key: string, cost?: number): Promise<RateLimitResult>;
}

export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly windowMs: number;
  private readonly maxLimit: number;
  private readonly timestamps = new Map<string, number[]>();

  constructor(maxLimit: number, windowMs: number = 60000) {
    this.maxLimit = maxLimit;
    this.windowMs = windowMs;
  }

  public async consume(key: string, cost: number = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let queue = this.timestamps.get(key) || [];
    // Prune entries older than sliding window
    queue = queue.filter((ts) => ts > windowStart);

    const currentCount = queue.length;
    const allowed = currentCount + cost <= this.maxLimit;

    if (allowed) {
      for (let i = 0; i < cost; i++) {
        queue.push(now);
      }
      this.timestamps.set(key, queue);
      const remaining = Math.max(0, this.maxLimit - queue.length);
      const resetSeconds = Math.ceil(this.windowMs / 1000);
      return {
        allowed: true,
        limit: this.maxLimit,
        remaining,
        resetSeconds
      };
    } else {
      this.timestamps.set(key, queue);
      const oldest = queue[0] || now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return {
        allowed: false,
        limit: this.maxLimit,
        remaining: 0,
        resetSeconds: retryAfterSeconds,
        retryAfterSeconds
      };
    }
  }

  public clear(): void {
    this.timestamps.clear();
  }
}
