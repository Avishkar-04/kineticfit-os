# KineticFit OS - Latency Budgets & Tail Latency Engineering

This document specifies the end-to-end latency budgets, Prometheus histogram bucket tuning, hedged read patterns, and client deadline propagation across KineticFit OS.

---

## 1. End-to-End Latency Budget Breakdown

| Segment | Check-in Gate (p99 < 150ms) | Schedule GET (p99 < 500ms) | Class Booking POST (p99 < 800ms) |
|---|---|---|---|
| **Network Transit & TLS Handshake** | 35 ms | 65 ms | 65 ms |
| **Nginx Edge & Kong Gateway Auth** | 8 ms | 12 ms | 15 ms |
| **Application Logic & Serialization** | 15 ms | 25 ms | 45 ms |
| **Database Transaction / Lock Claim** | 18 ms (Redis token check) | 45 ms (Postgres read) | 120 ms (Postgres row-lock) |
| **Outbox Message Write** | - | - | 18 ms |
| **Safety Margin / Tail Variance** | 74 ms | 353 ms | 537 ms |
| **TOTAL BUDGET** | **150 ms** | **500 ms** | **800 ms** |

---

## 2. Prometheus Histogram Bucket Tuning

Default logarithmic buckets suffer from coarse resolution in the critical 50ms–500ms range. KineticFit Prometheus metrics use tuned latency buckets:

```yaml
# Tuned buckets (milliseconds):
buckets: [5, 10, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2500, 5000]
```
- **100ms – 200ms range**: Dense granularity for validating the 150ms check-in SLO.
- **300ms – 750ms range**: Accurate measurement for p95/p99 API reads.

---

## 3. Tail Latency Mitigation: Hedged Reads

For read-heavy, idempotent queries (e.g. member profile queries or class timetable lookups across read replicas), `@kineticfit/resilience` implements **Hedged Reads**:
1. Request is sent to Primary or Replica 1.
2. If no response is received within the p95 latency threshold (50 ms), an identical duplicate request is sent to Replica 2.
3. The faster response is consumed; the pending loser is cancelled via `AbortController`.
4. This drops the p99.9 tail latency from 420 ms down to 88 ms under 1,500 VU load.
