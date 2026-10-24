import crypto from 'node:crypto';

export interface TraceContext {
  traceId: string;
  spanId: string;
  sampled: boolean;
}

export function generateTraceId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateSpanId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Parses W3C traceparent header: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 */
export function parseTraceparent(header?: string | null): TraceContext {
  if (!header) {
    return {
      traceId: generateTraceId(),
      spanId: generateSpanId(),
      sampled: true
    };
  }

  const parts = header.trim().split('-');
  if (parts.length >= 4 && parts[0] === '00') {
    return {
      traceId: parts[1],
      spanId: parts[2],
      sampled: parts[3] === '01'
    };
  }

  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    sampled: true
  };
}

export function formatTraceparent(context: TraceContext): string {
  return `00-${context.traceId}-${context.spanId}-${context.sampled ? '01' : '00'}`;
}
