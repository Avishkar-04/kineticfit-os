# Runbook: API Availability Burn Rate High (SEV1 / SEV2)

## Alert Overview
- **Alert Names**: `ApiAvailabilityBurnRateHigh1h` (SEV1), `ApiAvailabilityBurnRateHigh6h` (SEV2)
- **Severity**: SEV1 (Page immediately) / SEV2
- **Trigger**: Multi-window burn rate exceeding 14.4x (1h/5m) or 6x (6h/30m) consuming >2% of the 30-day error budget.

---

## 1. Customer Impact
Athletes cannot log in, check into turnstiles, or book classes. Front desk operations impacted. Potential revenue loss on new signups.

---

## 2. Dashboards
- **Grafana**: [API Golden Signals](http://grafana.kineticfit.os/d/kf-api-golden-signals)
- **Error Budget**: [SLO & Multi-Burn-Rate Dashboard](http://grafana.kineticfit.os/d/kf-slo-error-budget)
- **In-App Health**: Navigating to `/system` on admin portal

---

## 3. First 5 Diagnostic Checks
1. **Identify Failing Service**: Check Grafana API Golden Signals to isolate which service is returning 5xx (`auth-service`, `scheduling-service`, `billing-service`).
2. **Review Recent Deployments**: Run `kubectl argo rollouts list rollouts -n kineticfit` to see if a rollout completed recently.
3. **Database Connectivity**: Verify PostgreSQL and PgBouncer pool status (`pgbouncer_pools_waiting_clients > 0`).
4. **Inspect Correlated Error Logs**:
   ```bash
   kubectl logs -n kineticfit -l app.kubernetes.io/name=<service> --tail=100 | grep '"level":"error"'
   ```
5. **Check Resource Saturation**: Check if pods are getting OOMKilled or CPU throttled:
   ```bash
   kubectl get pods -n kineticfit -l app.kubernetes.io/part-of=kineticfit-os
   ```

---

## 4. Immediate Mitigations
- **If Recent Deployment Caused Regression**:
  ```bash
  kubectl rollout undo deployment/<service-name> -n kineticfit
  ```
- **If Database Saturation / Starvation**:
  Scale PgBouncer pool or scale down background workers:
  ```bash
  kubectl scale deployment scheduling-service --replicas=4 -n kineticfit
  ```
- **If Malicious Flood**:
  Activate Nginx rate limiting override or ModSecurity emergency rule in `deploy/k8s/base/ingress.yaml`.

---

## 5. Escalation Path
- **Incident Commander (IC)**: Primary on-call SRE
- **Domain Lead**: Backend Core Team Lead
- **Escalation SLA**: 15 minutes to engage secondary if unmitigated.
