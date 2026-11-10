# Runbook: Circuit Breaker Open Long Duration (SEV2)

## Alert Overview
- **Alert Name**: `CircuitBreakerOpenLongDuration`
- **Severity**: SEV2
- **Trigger**: A circuit breaker has remained in `OPEN` state for > 5 minutes.

---

## 1. Customer Impact
Downstream dependency is unreachable or failing. Microservice is running in degraded fallback mode (fail-fast without TCP socket timeout hangs). For example:
- `postgres-pool-cb`: Read queries returning cached data or failing immediately.
- `payment-gateway-cb`: New credit card transactions temporarily paused.
- `inbody-api-cb`: Manual scan import required.

---

## 2. Dashboards
- **Grafana**: [Redis Cache & Fencing Leases](http://grafana.kineticfit.os/d/kf-redis)
- **API Golden Signals**: [API Golden Signals](http://grafana.kineticfit.os/d/kf-api-golden-signals)

---

## 3. First 5 Diagnostic Checks
1. Identify the name of the tripped circuit breaker from the alert label (`labels.name`).
2. Test network reachability from within the pod to the downstream target:
   ```bash
   kubectl exec -it <pod-name> -n kineticfit -- curl -I -m 5 <target-host>
   ```
3. Check downstream dependency logs and health probes.
4. Verify whether circuit breaker half-open probe requests are failing.
5. Check DNS resolution for the downstream host.

---

## 4. Immediate Mitigations
- If downstream dependency was restarted and is healthy: Circuit breaker will transition to `HALF_OPEN` automatically within `resetTimeoutMs` (30s) and close upon successful probe.
- If upstream network partition: Follow Toxiproxy / Network Partition runbook.
- If downstream dependency is permanently down: Enable mock fallback provider in service config.

---

## 5. Escalation Path
- Reliability Platform SRE
- Service Owner Lead

