# Runbook: Database Replication Lag High (SEV2)

## Alert Overview
- **Alert Name**: `DatabaseReplicationLagHigh`
- **Severity**: SEV2
- **Trigger**: PostgreSQL streaming standby replication lag > 10 seconds for > 3 minutes.

---

## 1. Customer Impact
Athletes viewing schedule or athlete roster may see stale read data (eventual consistency window exceeded). If primary fails over now, RPO > 5 min SLA is violated.

---

## 2. Dashboards
- **Grafana**: [PostgreSQL & PgBouncer](http://grafana.kineticfit.os/d/kf-postgres-pgbouncer)
- **Host Metrics**: Disk I/O & Network throughput

---

## 3. First 5 Diagnostic Checks
1. Check replication status directly in PostgreSQL:
   ```sql
   SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn,
          ROUND(EXTRACT(epoch FROM (now() - reply_time))) as lag_seconds
   FROM pg_stat_replication;
   ```
2. Check replica disk space (`df -h /var/lib/postgresql/data`).
3. Check primary transaction write volume (large bulk data seed or monthly partition creation in progress?).
4. Check network bandwidth and packet loss between primary and replica nodes.
5. Review replica error log (`kubectl logs -n kineticfit -l role=replica`).

---

## 4. Immediate Mitigations
- If caused by heavy analytics queries running on the replica holding locks:
  ```sql
  SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state != 'idle' AND query_start < now() - interval '5 minutes';
  ```
- If replica disk is full: Expand PVC volume storage immediately.
- If lag cannot catch up: Divert read traffic back to primary using `@kineticfit/resilience` `ReplicaRouter` (it automatically falls back to primary when lag exceeds threshold).

---

## 5. Escalation Path
- Primary Database Administrator (DBA)
- Cloud Infrastructure On-Call

