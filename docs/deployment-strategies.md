# KineticFit OS - Progressive Delivery & Deployment Strategies

KineticFit OS employs three deployment patterns aligned with the risk profile of each microservice, orchestrated using **Argo Rollouts** and **Kubernetes Native Controllers**.

---

## 1. Deployment Strategies Matrix

| Strategy | Services | Routing Mechanism | Analysis / Health Gate | Rollback Mechanism |
|---|---|---|---|---|
| **Rolling Update** | `auth-service`, `member-service`, `access-service`, `nutrition-service` | Kubernetes Service | Readiness & Startup Probes (`maxUnavailable: 0`) | `kubectl rollout undo` |
| **Blue-Green** | `web` (SPA), `billing-service` (Stripe/Razorpay) | Argo Rollouts Active/Preview Services | Automated pre-promotion smoke tests | Immediate traffic switch back to active replica set |
| **Canary Release** | `scheduling-service` (high-concurrency booking) | Ingress-Nginx header & percentage weights | Prometheus metric analysis (error rate < 1%, p99 latency < 500 ms) | Automated abort on metric failure (`kubectl argo rollouts abort`) |

---

## 2. Canary Release Progression

For `scheduling-service`, traffic progresses automatically over a 15-minute evaluation window:

```
[ Step 1: 5% Weight ] ---> Prometheus Analysis (30s x 3, p99 < 500ms, errors < 1%)
         |
      (Passed)
         v
[ Step 2: 25% Weight ] ---> Prometheus Analysis (5m pause)
         |
      (Passed)
         v
[ Step 3: 50% Weight ] ---> Prometheus Analysis (5m pause)
         |
      (Passed)
         v
[ Step 4: 100% Weight ] ---> Full Promotion
```

### Automated Abort
If error rate exceeds 1% or p99 latency exceeds 500 ms at any step, Argo Rollouts immediately resets traffic weight to 0% and marks the rollout `Degraded`.

---

## 3. Database Expand-and-Contract Compatibility

To enable zero-downtime blue-green and canary rollouts:
1. **Expand**: Add nullable columns or new tables in pre-deploy migration Job (`deploy/k8s/base/db-migration-job.yaml`).
2. **Migrate**: Roll out new service code that reads from both old and new schema structures.
3. **Contract**: After full promotion, run cleanup migrations removing deprecated columns.

