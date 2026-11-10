import { describe, it, expect, beforeEach } from 'vitest';
import {
  RedisLeaseLeaderElector,
  ReplicaRouter,
  ShardRouter,
  DatabaseNode
} from '../src/index.js';

describe('Resilience: Leader Election & Replica Routing', () => {
  beforeEach(() => {
    RedisLeaseLeaderElector.resetCluster();
  });

  it('elects a single leader with a monotonic fencing token and rejects contenders', async () => {
    const candidateA = new RedisLeaseLeaderElector({
      leaseName: 'kf-scheduler-lease',
      candidateId: 'worker-pod-alpha',
      ttlMs: 2000
    });

    const candidateB = new RedisLeaseLeaderElector({
      leaseName: 'kf-scheduler-lease',
      candidateId: 'worker-pod-beta',
      ttlMs: 2000
    });

    // 1. Candidate A acquires lease
    const acquiredA = await candidateA.acquire();
    expect(acquiredA).toBe(true);
    expect(candidateA.isLeader).toBe(true);
    expect(candidateA.fencingToken).toBe(1);

    // 2. Candidate B attempts to acquire and is rejected
    const acquiredB = await candidateB.acquire();
    expect(acquiredB).toBe(false);
    expect(candidateB.isLeader).toBe(false);

    // 3. Candidate A successfully renews
    const renewed = await candidateA.renew();
    expect(renewed).toBe(true);

    // 4. Candidate A releases leadership
    await candidateA.release();
    expect(candidateA.isLeader).toBe(false);

    // 5. Candidate B now acquires with bumped fencing token
    const acquiredBAfterRelease = await candidateB.acquire();
    expect(acquiredBAfterRelease).toBe(true);
    expect(candidateB.isLeader).toBe(true);
    expect(candidateB.fencingToken).toBe(2);
  });

  it('routes write queries to primary and distributes reads across healthy replicas', () => {
    const nodes: DatabaseNode[] = [
      { id: 'db-primary', role: 'PRIMARY', host: 'pg-primary', port: 5432, replicationLagMs: 0, isHealthy: true },
      { id: 'db-replica-1', role: 'REPLICA', host: 'pg-replica-1', port: 5432, replicationLagMs: 20, isHealthy: true },
      { id: 'db-replica-2', role: 'REPLICA', host: 'pg-replica-2', port: 5432, replicationLagMs: 40, isHealthy: true }
    ];

    const router = new ReplicaRouter({ nodes, maxStalenessToleranceMs: 200 });

    // Write mutation -> Primary
    const writeRes = router.routeQuery('INSERT INTO members (id, name) VALUES (1, "Alex")');
    expect(writeRes.selectedNode.id).toBe('db-primary');
    expect(writeRes.reason).toBe('WRITE_MUTATION_PRIMARY');

    // SELECT query -> Replicas round-robin
    const readRes1 = router.routeQuery('SELECT * FROM class_sessions WHERE hub_id = 2');
    expect(readRes1.selectedNode.role).toBe('REPLICA');
    expect(readRes1.reason).toBe('REPLICA_ROUND_ROBIN');

    const readRes2 = router.routeQuery('SELECT * FROM diet_protocols');
    expect(readRes2.selectedNode.role).toBe('REPLICA');
  });

  it('automatically falls back to primary when all replicas exceed replication lag tolerance', () => {
    const nodes: DatabaseNode[] = [
      { id: 'db-primary', role: 'PRIMARY', host: 'pg-primary', port: 5432, replicationLagMs: 0, isHealthy: true },
      { id: 'db-replica-1', role: 'REPLICA', host: 'pg-replica-1', port: 5432, replicationLagMs: 50, isHealthy: true }
    ];

    const router = new ReplicaRouter({ nodes, maxStalenessToleranceMs: 100 });

    // Initially reads from replica
    expect(router.routeQuery('SELECT 1').selectedNode.id).toBe('db-replica-1');

    // Simulate high replication lag (e.g. 350 ms due to network partition)
    router.setReplicaLag('db-replica-1', 350);

    // Stale replica is shed; query safely falls back to Primary
    const laggedRead = router.routeQuery('SELECT 1');
    expect(laggedRead.selectedNode.id).toBe('db-primary');
    expect(laggedRead.reason).toBe('REPLICA_LAG_FALLBACK_TO_PRIMARY');
  });

  it('consistently hashes entities to 2 shards', () => {
    const shardRouter = new ShardRouter(['shard_0', 'shard_1']);
    const hubDowntown = '01931668-8000-7000-8000-000000000002';
    const hubUptown = '01931668-8000-7000-8000-000000000003';

    const shard1 = shardRouter.getShardForEntity(hubDowntown);
    const shard2 = shardRouter.getShardForEntity(hubUptown);

    expect(['shard_0', 'shard_1']).toContain(shard1);
    expect(['shard_0', 'shard_1']).toContain(shard2);
    // Consistent hashing returns same shard for same entity
    expect(shardRouter.getShardForEntity(hubDowntown)).toBe(shard1);
  });
});
