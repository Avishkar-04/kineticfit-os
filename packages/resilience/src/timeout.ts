export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export class DeadlineExceededError extends Error {
  constructor() {
    super('Request deadline exceeded by upstream caller');
    this.name = 'DeadlineExceededError';
  }
}

export interface TimeoutOptions {
  timeoutMs?: number;
  deadlineEpochMs?: number;
  abortSignal?: AbortSignal;
}

export async function executeWithTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const controller = new AbortController();
  const now = Date.now();

  let effectiveTimeoutMs = options.timeoutMs ?? 3000;
  if (options.deadlineEpochMs) {
    const remainingDeadline = options.deadlineEpochMs - now;
    if (remainingDeadline <= 0) {
      throw new DeadlineExceededError();
    }
    effectiveTimeoutMs = Math.min(effectiveTimeoutMs, remainingDeadline);
  }

  if (options.abortSignal) {
    options.abortSignal.addEventListener('abort', () => controller.abort());
  }

  const timer = setTimeout(() => {
    controller.abort();
  }, effectiveTimeoutMs);

  try {
    const result = await fn(controller.signal);
    clearTimeout(timer);
    return result;
  } catch (err: any) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      throw new TimeoutError(effectiveTimeoutMs);
    }
    throw err;
  }
}
