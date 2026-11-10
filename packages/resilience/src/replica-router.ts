import crypto from 'node:crypto';

export interface DatabaseNode {
  id: string;
  role: 'PRIMARY' | 'REPLICA';
  host: string;
  port: number;
  replicationLagMs: number;
  isHealthy: boolean;
}

export interface ReplicaRouterOptions {
  maxStalenessToleranceMs?: number; // fallback to primary if lag > threshold
  nodes: DatabaseNode[];
}

export type QueryType = 'READ' | 'WRITE';

export class ReplicaRouter {
  private readonly maxStalenessToleranceMs: number;
  private readonly nodes: DatabaseNode[];
  private replicaIndex = 0;

  constructor(options: ReplicaRouterOptions) {
    this.maxStalenessToleranceMs = options.maxStalenessToleranceMs || 500;
    this.nodes = options.nodes;
  }

  public getPrimary(): DatabaseNode {
    const primary = this.nodes.find((n) => n.role === 'PRIMARY' && n.isHealthy);
    if (!primary) {
      throw new Error('No healthy PRIMARY database node available');
    }
    return primary;
  }

  public getReadNode(): DatabaseNode {
    // Filter healthy replicas within replication lag tolerance
    const eligibleReplicas = this.nodes.filter(
      (n) => n.role === 'REPLICA' && n.isHealthy && n.replicationLagMs <= this.maxStalenessToleranceMs
    );

    if (eligibleReplicas.length === 0) {
      // Fallback to primary if all replicas are down or lagging
      return this.getPrimary();
    }

    // Round-robin over eligible replicas
    const selected = eligibleReplicas[this.replicaIndex % eligibleReplicas.length];
    this.replicaIndex++;
    return selected;
  }

  public routeQuery(querySql: string): { selectedNode: DatabaseNode; reason: string } {
    const trimmed = querySql.trim().toUpperCase();
    const isWrite =
      trimmed.startsWith('INSERT') ||
      trimmed.startsWith('UPDATE') ||
      trimmed.startsWith('DELETE') ||
      trimmed.startsWith('CREATE') ||
      trimmed.startsWith('DROP') ||
      trimmed.startsWith('ALTER') ||
      trimmed.includes('FOR UPDATE');

    if (isWrite) {
      return {
        selectedNode: this.getPrimary(),
        reason: 'WRITE_MUTATION_PRIMARY'
      };
    }

    const node = this.getReadNode();
    const reason =
      node.role === 'PRIMARY' ? 'REPLICA_LAG_FALLBACK_TO_PRIMARY' : 'REPLICA_ROUND_ROBIN';

    return { selectedNode: node, reason };
  }

  public setReplicaLag(nodeId: string, lagMs: number): void {
    const target = this.nodes.find((n) => n.id === nodeId);
    if (target) {
      target.replicationLagMs = lagMs;
    }
  }

  public setNodeHealth(nodeId: string, isHealthy: boolean): void {
    const target = this.nodes.find((n) => n.id === nodeId);
    if (target) {
      target.isHealthy = isHealthy;
    }
  }
}

/**
 * 2-Shard Virtual Router based on consistent hashing of Org/Hub IDs.
 * Used for horizontal scaling in the HA profile.
 */
export class ShardRouter {
  private readonly shardIds: string[];

  constructor(shardIds: string[] = ['shard_0', 'shard_1']) {
    this.shardIds = shardIds;
  }

  public getShardForEntity(entityId: string): string {
    const hash = crypto.createHash('md5').update(entityId).digest('hex');
    const numericVal = parseInt(hash.substring(0, 8), 16);
    const index = numericVal % this.shardIds.length;
    return this.shardIds[index];
  }
}

