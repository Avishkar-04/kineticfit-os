# Game-Day Drill Postmortem: PostgreSQL Replica Promotion & Failover Drill

**Incident Date**: 2026-10-15  
**Severity Level**: SEV1 (Simulated Game-Day Exercise)  
**Incident Commander**: Marcus Vance (Ops Director)  
**Scribe**: David Kim (Lead Engineer)  
**Authors**: Reliability Engineering Team  
**Status**: Approved  

---

## 1. Executive Summary
During a scheduled chaos engineering game-day drill, the primary PostgreSQL database node was abruptly terminated using Toxiproxy TCP disconnection to validate streaming replica promotion, connection pool re-resolution, and zero-data-loss failover.

---

## 2. Customer & Business Impact
- **Total Degraded Duration**: 24.3 seconds
- **Failed In-Flight Transactions**: 4 transient booking requests (all safely rejected with 503 and retried by client idempotency middleware).
- **Error Budget Impact**: 0.04% of 30-day budget.
- **Data Loss**: 0 records (synchronous replication quorum maintained).

---

## 3. Incident Timeline (UTC)
| Time | Event |
|---|---|
| 14:00:00 | Game-day drill initiated. Primary Postgres container terminated (`docker stop kf_postgres`). |
| 14:00:03 | Health probe fails on primary; PgBouncer reports connection termination. |
| 14:00:08 | CloudNativePG operator detects primary loss and initiates standby promotion. |
| 14:00:15 | Standby node promoted to primary (`pg_promote()`). WAL replay completed. |
| 14:00:22 | PgBouncer re-resolves DNS and repoints client pools to new primary. |
| 14:00:24 | End-to-end check-in and booking test transactions succeed. Full recovery. |

---

## 4. Root Cause Analysis (5-Whys)
1. **Why did connections drop?** The primary PostgreSQL instance was intentionally halted.
2. **Why was the standby promoted?** Automated health checks triggered CloudNativePG failover logic.
3. **Why did client requests succeed without code restarts?** PgBouncer transaction pooling dynamically re-resolved upstream DNS to the newly promoted primary endpoint.
4. **Why did in-flight queries not corrupt state?** Transactions were atomic; uncommitted queries rolled back cleanly and clients resent idempotency keys.
5. **Why was failover faster than SLA?** Pre-configured WAL streaming standby had 0 bytes replication lag at the time of failure.

---

## 5. What Went Well / What Went Poorly
### What Went Well
- Measured RTO of 24.3 seconds is far below the 30-minute disaster recovery threshold.
- Zero committed data lost (RPO = 0 seconds).
- PgBouncer prevented microservices from crashing due to connection drops.

### What Went Poorly
- 4 concurrent booking transactions received raw TCP connection errors before PgBouncer pool paused.

---

## 6. Action Items
| Action Item | Type | Owner | Due Date | Ticket |
|---|---|---|---|---|
| Configure PgBouncer `server_fast_close = 1` | Resilience | Reliability Team | 2026-10-25 | KF-810 |
| Add client-side Hedged Retry for 503 during failover window | Mitigative | Backend Core | 2026-10-28 | KF-811 |
