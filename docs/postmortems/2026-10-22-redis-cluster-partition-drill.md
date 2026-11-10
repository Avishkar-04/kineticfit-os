# Game-Day Drill Postmortem: Redis Cluster Partition & Rate-Limit Fail-Open Drill

**Incident Date**: 2026-10-22  
**Severity Level**: SEV2 (Simulated Game-Day Exercise)  
**Incident Commander**: Marcus Vance (Ops Director)  
**Scribe**: Elena Rostova (Coach / Tech Staff)  
**Authors**: Reliability Engineering Team  
**Status**: Approved  

---

## 1. Executive Summary
A game-day drill was executed to simulate an isolated network partition between application microservices and the Redis caching/rate-limiting cluster. The goal was to verify that public read traffic (timetable and landing page) fails open gracefully while sensitive write traffic (authentication and booking locks) fails closed securely.

---

## 2. Customer & Business Impact
- **Degraded Duration**: 6 minutes
- **Public Schedule Readers**: 100% successful access (gracefully degraded to fail-open mode).
- **Turnstile Badge Scanners**: Fallback to local JWT verification on kiosk cache (zero gym entry rejections).
- **Password Brute-Force Rate Limiting**: Temporarily switched to in-memory sliding window rate limiter.
- **Error Budget Impact**: 0.00% (No 5xx errors returned).

---

## 3. Incident Timeline (UTC)
| Time | Event |
|---|---|
| 16:00:00 | Toxiproxy partition injected: Port 6379 blackholed with TCP reset (`reset_peer`). |
| 16:00:02 | First Redis command times out with `ECONNRESET`. |
| 16:00:05 | `@kineticfit/resilience` circuit breaker trips to `OPEN` for Redis client. |
| 16:00:06 | `SlidingWindowRateLimiter` detects circuit breaker open and engages fail-open for public schedule endpoints. |
| 16:00:10 | Kiosk access scanners continue turnstile operations using local offline JWT cache. |
| 16:05:40 | Toxiproxy toxic removed; Redis connectivity restored. |
| 16:06:05 | Circuit breaker half-open probe succeeds and transitions back to `CLOSED`. |
| 16:06:10 | Normal distributed rate-limiting and caching resumed across all pods. |

---

## 4. Root Cause Analysis (5-Whys)
1. **Why did Redis calls fail?** Toxiproxy injected connection reset packets simulating an AWS ElastiCache network partition.
2. **Why didn't services crash or hang?** The `@kineticfit/resilience` CircuitBreaker and strict 500ms command timeouts prevented socket thread starvation.
3. **Why did users still see the timetable?** The rate-limiter and cache-aside layers implemented an explicit graceful degradation fallback policy.
4. **Why did turnstiles keep unlocking?** Kiosk turnstiles possess an embedded offline cache with valid public Ed25519 signing keys.
5. **Why was recovery instantaneous?** As soon as TCP reachability returned, the circuit breaker closed on the first successful health probe.

---

## 5. What Went Well / What Went Poorly
### What Went Well
- Zero gym members were locked out of the facility during the entire Redis partition.
- Circuit breaker prevented database cascading failure.
- Fail-open policy operated exactly as designed in the architecture specification.

### What Went Poorly
- The circuit breaker alert took 5 minutes to trigger (tuned per alert threshold).

---

## 6. Action Items
| Action Item | Type | Owner | Due Date | Ticket |
|---|---|---|---|---|
| Add Prometheus gauge for circuit breaker degraded fallback mode | Observability | Platform Team | 2026-10-30 | KF-902 |
| Verify Redis client connection keepalive timeout tuning | Performance | Backend Core | 2026-11-05 | KF-903 |
