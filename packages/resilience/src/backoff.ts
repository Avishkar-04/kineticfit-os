export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  factor?: number;
}

export function calculateFullJitter(attempt: number, options: BackoffOptions = {}): number {
  const baseMs = options.baseMs ?? 100;
  const maxMs = options.maxMs ?? 5000;
  const factor = options.factor ?? 2;

  const temp = Math.min(maxMs, baseMs * Math.pow(factor, attempt));
  // Full jitter: uniformly random between 0 and temp
  return Math.floor(Math.random() * temp);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
