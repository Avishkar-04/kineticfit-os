# KineticFit OS - On-Call Handbook & Rotation Policy

This handbook details on-call expectations, shift handoff procedures, escalation paths, and paging policies for engineers maintaining KineticFit OS.

---

## 1. On-Call Rotations & Shifts

- **Shift Structure**: 1-week primary rotation, 1-week secondary rotation (handoff every Tuesday at 10:00 UTC).
- **Primary On-Call**:
  - Carries PagerDuty mobile and laptop during the 7-day shift.
  - Acknowledges SEV1 alerts within **5 minutes** and SEV2 alerts within **15 minutes**.
  - Triages incoming alerts from Alertmanager.
- **Secondary On-Call**:
  - Automatically escalated to if primary fails to acknowledge an alert within 10 minutes.
  - Acts as Scribe / Co-pilot during SEV1/SEV2 incidents.

---

## 2. Weekly Shift Handoff Checklist

Before completing shift handoff each Tuesday:
- [ ] Review all Alertmanager alerts fired during the previous 7 days.
- [ ] Check `/system` DLQ depth across all RabbitMQ queues.
- [ ] Verify that all automated nightly backup restore drills (`scripts/verify-restore.sh`) completed green.
- [ ] Check 30-day error budget burn on the Grafana SLO dashboard.
- [ ] Review any open action items from previous postmortems.
- [ ] Verify PagerDuty phone override schedule is active.

---

## 3. Paging Escalation Policy

```
[ Alert Fires in Alertmanager ]
             |
       (0 minutes)
             v
 [ Page Primary Engineer ]
             |
     (Unacknowledged after 5m)
             v
 [ Page Secondary Engineer ]
             |
     (Unacknowledged after 10m)
             v
  [ Page Engineering Director / VP ]
```
