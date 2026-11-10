# Runbook: Canary Analysis Failed & Auto-Aborted (SEV2)

## Alert Overview
- **Alert Name**: `CanaryAnalysisFailed`
- **Severity**: SEV2
- **Trigger**: Argo Rollouts canary deployment failed automated metric analysis (success rate < 99% or p99 latency > 500ms) and initiated an emergency auto-abort.

---

## 1. Customer Impact
Automated progressive delivery safely prevented a bad release from rolling out to 100% of gym users. Between 5% and 25% of users may have experienced errors or elevated latency during the 2–5 minute analysis window.

---

## 2. Dashboards
- **Grafana**: [Deployment & Canary Analysis](http://grafana.kineticfit.os/d/kf-deployment-canary)
- **API Golden Signals**: [API Golden Signals](http://grafana.kineticfit.os/d/kf-api-golden-signals)

---

## 3. First 5 Diagnostic Checks
1. Check rollout status:
   ```bash
   kubectl argo rollouts get rollout <rollout-name> -n kineticfit
   ```
2. Verify which metric triggered the abort:
   - `success-rate`: Error rate exceeded 1%.
   - `p99-latency`: p99 response time exceeded 500 ms.
3. Review logs of the canary pods specifically:
   ```bash
   kubectl logs -n kineticfit -l app.kubernetes.io/name=<service-name>,rollouts-pod-template-hash=<canary-hash> --tail=100
   ```
4. Verify that traffic weight was automatically dropped to 0% and stable pods are serving 100% of user traffic.
5. Check if recent database migration caused an incompatibility with the canary code (expand-and-contract violation).

---

## 4. Immediate Mitigations
- Rollout is already automatically aborted by Argo Rollouts controller.
- Confirm full traffic restored to stable:
   ```bash
   kubectl argo rollouts undo <rollout-name> -n kineticfit
   ```
- Notify release engineer and lock deployment pipeline until root cause is patched.

---

## 5. Escalation Path
- Delivery Release Engineer
- Service Tech Lead

