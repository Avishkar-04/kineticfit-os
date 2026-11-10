import { EventEmitter } from 'node:events';

export interface LeaderElectionOptions {
  leaseName: string;
  candidateId: string;
  ttlMs?: number;
  heartbeatIntervalMs?: number;
}

export interface ILeaderElector {
  readonly isLeader: boolean;
  readonly fencingToken: number;
  acquire(): Promise<boolean>;
  renew(): Promise<boolean>;
  release(): Promise<void>;
  start(): void;
  stop(): void;
  on(event: 'gained' | 'lost' | 'renewed', listener: (...args: any[]) => void): this;
}

/**
 * Leader Elector implementation with monotonic fencing tokens.
 * Compatible with Redis SET key value NX PX and K8s Leases.
 */
export class RedisLeaseLeaderElector extends EventEmitter implements ILeaderElector {
  private _isLeader = false;
  private _fencingToken = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readonly leaseName: string;
  private readonly candidateId: string;
  private readonly ttlMs: number;
  private readonly heartbeatIntervalMs: number;

  // Shared in-memory cluster registry simulating Redis distributed keys
  private static clusterLeases = new Map<string, {
    holderId: string;
    expiresAt: number;
    fencingToken: number;
  }>();

  constructor(options: LeaderElectionOptions) {
    super();
    this.leaseName = options.leaseName;
    this.candidateId = options.candidateId;
    this.ttlMs = options.ttlMs || 5000;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || Math.floor(this.ttlMs / 3);
  }

  public get isLeader(): boolean {
    return this._isLeader;
  }

  public get fencingToken(): number {
    return this._fencingToken;
  }

  public async acquire(): Promise<boolean> {
    const now = Date.now();
    const current = RedisLeaseLeaderElector.clusterLeases.get(this.leaseName);

    if (!current || current.expiresAt <= now || current.holderId === this.candidateId) {
      const nextFencingToken = current ? current.fencingToken + 1 : 1;
      RedisLeaseLeaderElector.clusterLeases.set(this.leaseName, {
        holderId: this.candidateId,
        expiresAt: now + this.ttlMs,
        fencingToken: nextFencingToken
      });

      this._isLeader = true;
      this._fencingToken = nextFencingToken;
      this.emit('gained', { token: this._fencingToken, holder: this.candidateId });
      return true;
    }

    if (this._isLeader) {
      this._isLeader = false;
      this.emit('lost', { holder: current.holderId });
    }
    return false;
  }

  public async renew(): Promise<boolean> {
    if (!this._isLeader) {
      return this.acquire();
    }

    const now = Date.now();
    const current = RedisLeaseLeaderElector.clusterLeases.get(this.leaseName);

    if (current && current.holderId === this.candidateId) {
      current.expiresAt = now + this.ttlMs;
      this.emit('renewed', { token: this._fencingToken });
      return true;
    }

    // Lost lease due to expiry or theft
    this._isLeader = false;
    this.emit('lost', { reason: 'Lease expired or held by another candidate' });
    return false;
  }

  public async release(): Promise<void> {
    const current = RedisLeaseLeaderElector.clusterLeases.get(this.leaseName);
    if (current && current.holderId === this.candidateId) {
      // Mark lease released while preserving monotonic fencing token
      RedisLeaseLeaderElector.clusterLeases.set(this.leaseName, {
        holderId: '',
        expiresAt: 0,
        fencingToken: current.fencingToken
      });
    }
    if (this._isLeader) {
      this._isLeader = false;
      this.emit('lost', { reason: 'Explicit release' });
    }
  }

  public start(): void {
    this.acquire();
    this.heartbeatTimer = setInterval(async () => {
      if (this._isLeader) {
        await this.renew();
      } else {
        await this.acquire();
      }
    }, this.heartbeatIntervalMs);
  }

  public stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.release();
  }

  public static resetCluster(): void {
    RedisLeaseLeaderElector.clusterLeases.clear();
  }
}
