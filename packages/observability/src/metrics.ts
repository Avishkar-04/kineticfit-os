export interface MetricLabels {
  [key: string]: string | number;
}

export class Counter {
  private readonly counts = new Map<string, number>();

  constructor(public readonly name: string, public readonly help: string) {}

  private getLabelKey(labels: MetricLabels = {}): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  public inc(labels: MetricLabels = {}, value: number = 1): void {
    const key = this.getLabelKey(labels);
    this.counts.set(key, (this.counts.get(key) || 0) + value);
  }

  public get(labels: MetricLabels = {}): number {
    return this.counts.get(this.getLabelKey(labels)) || 0;
  }

  public toPrometheus(): string {
    let output = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n`;
    for (const [labels, val] of this.counts.entries()) {
      output += labels ? `${this.name}{${labels}} ${val}\n` : `${this.name} ${val}\n`;
    }
    return output;
  }
}

export class Gauge {
  private readonly values = new Map<string, number>();

  constructor(public readonly name: string, public readonly help: string) {}

  private getLabelKey(labels: MetricLabels = {}): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  public set(value: number, labels: MetricLabels = {}): void {
    this.values.set(this.getLabelKey(labels), value);
  }

  public get(labels: MetricLabels = {}): number {
    return this.values.get(this.getLabelKey(labels)) || 0;
  }

  public toPrometheus(): string {
    let output = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n`;
    for (const [labels, val] of this.values.entries()) {
      output += labels ? `${this.name}{${labels}} ${val}\n` : `${this.name} ${val}\n`;
    }
    return output;
  }
}

export class Histogram {
  private readonly buckets: number[];
  private readonly counts = new Map<string, { bucketCounts: number[]; sum: number; count: number }>();

  constructor(public readonly name: string, public readonly help: string, buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]) {
    this.buckets = [...buckets].sort((a, b) => a - b);
  }

  private getLabelKey(labels: MetricLabels = {}): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  public observe(val: number, labels: MetricLabels = {}): void {
    const key = this.getLabelKey(labels);
    let entry = this.counts.get(key);
    if (!entry) {
      entry = { bucketCounts: new Array(this.buckets.length).fill(0), sum: 0, count: 0 };
      this.counts.set(key, entry);
    }

    entry.count++;
    entry.sum += val;

    for (let i = 0; i < this.buckets.length; i++) {
      if (val <= this.buckets[i]) {
        entry.bucketCounts[i]++;
      }
    }
  }

  public toPrometheus(): string {
    let output = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} histogram\n`;
    for (const [labels, entry] of this.counts.entries()) {
      const baseLabel = labels ? `${labels},` : '';
      for (let i = 0; i < this.buckets.length; i++) {
        output += `${this.name}_bucket{${baseLabel}le="${this.buckets[i]}"} ${entry.bucketCounts[i]}\n`;
      }
      output += `${this.name}_bucket{${baseLabel}le="+Inf"} ${entry.count}\n`;
      output += `${this.name}_sum{${labels}} ${entry.sum}\n`;
      output += `${this.name}_count{${labels}} ${entry.count}\n`;
    }
    return output;
  }
}

export class MetricsRegistry {
  private readonly metrics: Array<Counter | Gauge | Histogram> = [];

  public register<T extends Counter | Gauge | Histogram>(metric: T): T {
    this.metrics.push(metric);
    return metric;
  }

  public render(): string {
    return this.metrics.map((m) => m.toPrometheus()).join('\n');
  }
}

export const globalMetrics = new MetricsRegistry();

// Standard RED metrics
export const httpRequestsTotal = globalMetrics.register(
  new Counter('http_requests_total', 'Total HTTP requests partitioned by status and route')
);
export const httpRequestDurationSeconds = globalMetrics.register(
  new Histogram('http_request_duration_seconds', 'HTTP request duration latency in seconds', [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5])
);
export const liveTurnstileSaturationGauge = globalMetrics.register(
  new Gauge('live_turnstile_saturation_gauge', 'Current floor occupancy saturation ratio')
);
