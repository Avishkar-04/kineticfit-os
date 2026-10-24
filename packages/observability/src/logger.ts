export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  requestId?: string;
  orgId?: string;
  hubId?: string;
  userId?: string;
  [key: string]: unknown;
}

const REDACT_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'refreshtoken',
  'pin',
  'keycardpin',
  'cvv',
  'creditcard',
  'apikey'
]);

export function redactObject(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (REDACT_KEYS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      result[key] = redactObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export class Logger {
  constructor(private readonly serviceName: string, private readonly defaultContext: LogContext = {}) {}

  public child(context: LogContext): Logger {
    return new Logger(this.serviceName, { ...this.defaultContext, ...context });
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      context: redactObject({ ...this.defaultContext, ...meta })
    };
    const serialized = JSON.stringify(entry);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }
}

export function createLogger(serviceName: string, context?: LogContext): Logger {
  return new Logger(serviceName, context);
}
