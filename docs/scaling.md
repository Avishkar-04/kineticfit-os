# KineticFit OS - Horizontal vs. Vertical Scaling Study

This document details the autoscaling architecture, right-sizing measurements, and empirical capacity benchmarks for KineticFit OS under synthetic and peak operational loads.

---

## 1. Architectural Scaling Dimensions

KineticFit OS separates concerns into three distinct scaling profiles:

| Workload Type | Services | Primary Bottleneck | Scaling Strategy | Scaling Trigger |
|---|---|---|---|---|
| **Stateless API Services** | `auth-service`, `member-service`, `access-service`, `nutrition-service` | CPU (crypto, JWT, JSON serialization) | Horizontal Pod Autoscaler (HPA) | CPU > 65%, RPS > 250 |
| **High-Contention Realtime** | `scheduling-service` (booking concurrency) | Database row-locks & memory | HPA + Read Replicas + Hedged Reads | CPU > 65%, Active DB connections |
| **Asynchronous Workers** | Background queue consumers (`dunning`, `notifications`, `export`) | RabbitMQ Queue Depth | KEDA ScaledObject | Queue length > 20 |
| **Relational Datastore** | PostgreSQL / PgBouncer | Connection saturation, Disk I/O | Vertical ACU + PgBouncer Pool + Read Replica | Connection count, IOPS |

---

## 2. Horizontal Scaling Verification (HPA & Scale-Out)

Synthetic load generation using `load-test/stress-test.js` (up to 2,000 VUs) demonstrates linear scale-out characteristics:

```
VU Load    Replicas    p50 Latency    p95 Latency    p99 Latency    Error Rate
-------    --------    -----------    -----------    -----------    ----------
100 VUs    2 pods      12 ms          38 ms          85 ms          0.00%
500 VUs    4 pods      18 ms          52 ms          110 ms         0.00%
1,200 VUs  8 pods      24 ms          78 ms          142 ms         0.01%
2,000 VUs  12 pods     31 ms          95 ms          178 ms         0.02%
```

### HPA Configuration
- **Target CPU Utilization**: 65%
- **Stabilization Window (Scale Down)**: 300 seconds (prevents pod thrashing during traffic bursts)
- **Scale Up Rate**: 100% or 4 pods every 15 seconds

---

## 3. Asynchronous Queue Scaling (KEDA)

KEDA monitors RabbitMQ quorum queues without polling lag:
- **`kf.booking.queue`**: Scales `scheduling-service` worker instances from 2 to 10 when queue length exceeds 20 pending booking saga events.
- **Scale to Zero (Dev/Staging)**: In non-production environments, worker replicas scale to 0 when idle for > 300 seconds, saving ~85% cloud compute spend.

---

## 4. Vertical Sizing & Pod Resource Budgets

Container sizing determined via 30-minute soak test baseline:

| Container | CPU Request | CPU Limit | Memory Request | Memory Limit | Target Pod Density |
|---|---|---|---|---|---|
| `auth-service` | 100m | 500m | 128Mi | 512Mi | 30 pods / m5.xlarge |
| `scheduling-service` | 100m | 500m | 128Mi | 512Mi | 25 pods / m5.xlarge |
| `web` (SPA) | 50m | 250m | 64Mi | 256Mi | 50 pods / m5.xlarge |
| `fn-pdf-export` | 200m | 1000m | 256Mi | 1024Mi | On-demand container |
