# Game-Day Drill Postmortem: Argo Rollouts Canary Anomaly Auto-Rollback Drill

**Incident Date**: 2026-11-02  
**Severity Level**: SEV2 (Simulated Progressive Delivery Rollback Drill)  
**Incident Commander**: Marcus Vance (Ops Director)  
**Scribe**: David Kim (Lead Engineer)  
**Authors**: Release Engineering & SRE Team  
**Status**: Approved  

---

## 1. Executive Summary
A game-day drill was performed to test the Argo Rollouts progressive delivery pipeline and Prometheus-based automated analysis for `scheduling-service`. A flawed revision containing an artificial 600ms latency sleep was deployed to the 5% canary step to verify that the controller automatically detects the anomaly, aborts the rollout, and reverts traffic to 100% stable with zero human intervention.

---

## 2. Customer & Business Impact
- **Degraded Duration**: 1 minute 15 seconds (limited strictly to the 5% canary evaluation interval).
- **Affected Requests**: ~18 booking requests experienced latency > 500ms.
- **Rollout Fate**: Automatically aborted and traffic weight restored to 0%.
- **Stable Pod Impact**: 95% of traffic was completely unaffected.
- **Error Budget Impact**: 0.01% of 30-day budget.

---

## 3. Incident Timeline (UTC)
| Time | Event |
|---|---|
| 11:00:00 | Injected canary revision `ghcr.io/kineticfit/scheduling-service:v1.1.0-defect` via `kubectl argo rollouts set image`. |
| 11:00:15 | Rollout reaches Step 1: 5% traffic weight routed to canary pods. |
| 11:00:30 | Argo Rollouts controller starts `kineticfit-success-rate-p99` Prometheus analysis template. |
| 11:01:00 | Prometheus metric query evaluates: `p99-latency = 642ms` (Failed condition `< 500ms`). |
| 11:01:05 | AnalysisTemplate records metric failure; failure limit (1) exceeded. |
| 11:01:10 | Rollout controller transitions phase to `Degraded` and executes emergency auto-abort. |
| 11:01:15 | Traffic routing weight instantly restored to 100% stable revision. Canary pods scaled to 0. |

---

## 4. Root Cause Analysis (5-Whys)
1. **Why did the canary fail?** The deployed container contained synthetic latency violating the p99 SLA.
2. **Why didn't this impact all gym members?** Progressive delivery routed only 5% of traffic to the candidate version.
3. **Why did the system abort without human intervention?** The Prometheus AnalysisTemplate evaluated the p99 latency metric every 30 seconds.
4. **Why did rollback take less than 10 seconds?** The stable ReplicaSet was maintained warm and ready, eliminating pod cold-start delay.
5. **Why were database writes safe?** The database schema followed expand-and-contract policy, allowing old and candidate code to operate simultaneously.

---

## 5. What Went Well / What Went Poorly
### What Went Well
- Automated analysis aborted the bad canary in 1 minute 15 seconds.
- 95% of users experienced zero impact.
- Emergency auto-rollback required 0 manual button clicks.

### What Went Poorly
- The Prometheus query window was 1 minute, causing a 30-second measurement delay before detection.

---

## 6. Action Items
| Action Item | Type | Owner | Due Date | Ticket |
|---|---|---|---|---|
| Tune AnalysisTemplate evaluation interval from 30s to 15s | Delivery | Release Team | 2026-11-10 | KF-950 |
| Add synthetic k6 smoke probe before opening 5% canary step | Testing | QA Lead | 2026-11-15 | KF-951 |

