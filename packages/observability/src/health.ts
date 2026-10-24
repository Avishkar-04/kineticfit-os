export type HealthStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface ComponentHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  service: string;
  version: string;
  components?: Record<string, ComponentHealth>;
}

export type HealthCheckFn = () => Promise<ComponentHealth>;

export class HealthProbeRegistry {
  private isDraining: boolean = false;
  private isStarted: boolean = false;
  private readonly readinessChecks = new Map<string, HealthCheckFn>();
  private readonly startupChecks = new Map<string, HealthCheckFn>();
  private readonly startTime = Date.now();

  constructor(private readonly serviceName: string, private readonly version: string = '1.0.0') {}

  public markDraining(): void {
    this.isDraining = true;
  }

  public markStarted(): void {
    this.isStarted = true;
  }

  public registerReadiness(name: string, check: HealthCheckFn): void {
    this.readinessChecks.set(name, check);
  }

  public registerStartup(name: string, check: HealthCheckFn): void {
    this.startupChecks.set(name, check);
  }

  public getLiveness(): HealthCheckResult {
    return {
      status: this.isDraining ? 'DOWN' : 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      service: this.serviceName,
      version: this.version
    };
  }

  public async getReadiness(): Promise<{ ok: boolean; result: HealthCheckResult }> {
    if (this.isDraining) {
      return {
        ok: false,
        result: {
          status: 'DOWN',
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
          service: this.serviceName,
          version: this.version,
          components: { server: { status: 'DOWN', message: 'Process draining' } }
        }
      };
    }

    const components: Record<string, ComponentHealth> = {};
    let allUp = true;

    for (const [name, check] of this.readinessChecks.entries()) {
      const start = Date.now();
      try {
        const comp = await check();
        comp.latencyMs = Date.now() - start;
        components[name] = comp;
        if (comp.status === 'DOWN') allUp = false;
      } catch (err: any) {
        components[name] = {
          status: 'DOWN',
          latencyMs: Date.now() - start,
          message: err.message
        };
        allUp = false;
      }
    }

    return {
      ok: allUp,
      result: {
        status: allUp ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
        service: this.serviceName,
        version: this.version,
        components
      }
    };
  }

  public async getStartup(): Promise<{ ok: boolean; result: HealthCheckResult }> {
    if (!this.isStarted && this.startupChecks.size === 0) {
      this.isStarted = true;
    }

    const components: Record<string, ComponentHealth> = {};
    let allUp = this.isStarted;

    for (const [name, check] of this.startupChecks.entries()) {
      const start = Date.now();
      try {
        const comp = await check();
        comp.latencyMs = Date.now() - start;
        components[name] = comp;
        if (comp.status === 'DOWN') allUp = false;
      } catch (err: any) {
        components[name] = {
          status: 'DOWN',
          latencyMs: Date.now() - start,
          message: err.message
        };
        allUp = false;
      }
    }

    return {
      ok: allUp,
      result: {
        status: allUp ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
        service: this.serviceName,
        version: this.version,
        components
      }
    };
  }
}
