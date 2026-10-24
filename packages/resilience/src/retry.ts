import { calculateFullJitter, sleep, BackoffOptions } from './backoff.js';

export interface RetryOptions extends BackoffOptions {
  maxRetries?: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export class RetryBudgetExhaustedError extends Error {
  constructor() {
    super('Retry budget exhausted (retry storm mitigation engaged).');
    this.name = 'RetryBudgetExhaustedError';
  }
}

/**
 * Tracks retry budget ratio. Section 9 rule: max 10% extra load from retries.
 */
export class RetryBudgetTracker {
  private baseRequests: number = 0;
  private retriedRequests: number = 0;
  private readonly maxRatio: number;

  constructor(maxRatio: number = 0.1) {
    this.maxRatio = maxRatio;
  }

  public recordBaseRequest(): void {
    this.baseRequests++;
    // Window decay to keep dynamic
    if (this.baseRequests > 10000) {
      this.baseRequests = Math.floor(this.baseRequests * 0.5);
      this.retriedRequests = Math.floor(this.retriedRequests * 0.5);
    }
  }

  public canRetry(): boolean {
    if (this.baseRequests < 10) return true; // Warmup grace
    return (this.retriedRequests / this.baseRequests) <= this.maxRatio;
  }

  public recordRetry(): void {
    this.retriedRequests++;
  }

  public getStats() {
    return {
      baseRequests: this.baseRequests,
      retriedRequests: this.retriedRequests,
      ratio: this.baseRequests > 0 ? this.retriedRequests / this.baseRequests : 0
    };
  }
}

export const globalRetryBudget = new RetryBudgetTracker(0.1);

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  budget: RetryBudgetTracker = globalRetryBudget
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const isRetryable = options.isRetryable ?? (() => true);

  budget.recordBaseRequest();

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries || !isRetryable(error)) {
        throw error;
      }

      if (!budget.canRetry()) {
        throw new RetryBudgetExhaustedError();
      }

      budget.recordRetry();
      const delayMs = calculateFullJitter(attempt, options);
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
}
