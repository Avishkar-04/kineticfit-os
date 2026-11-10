# Incident Postmortem: [Title]

**Incident Date**: YYYY-MM-DD  
**Severity Level**: SEV[1-4]  
**Incident Commander**: [Name]  
**Scribe**: [Name]  
**Authors**: [Name(s)]  
**Status**: [Draft / In Review / Approved]  

---

## 1. Executive Summary
Brief non-technical description of the incident, duration, and customer impact.

---

## 2. Customer & Business Impact
- **Total Downtime / Degraded Duration**: X minutes
- **Affected Endpoints / Features**:
- **Estimated Affected Users / Check-ins**:
- **Error Budget Impact**: X% consumed

---

## 3. Incident Timeline (UTC)
| Time | Event |
|---|---|
| HH:MM | Anomaly introduced / started |
| HH:MM | Alert fired in Alertmanager |
| HH:MM | On-call acknowledged page |
| HH:MM | Incident Commander declared SEV level |
| HH:MM | Mitigation applied |
| HH:MM | Systems verified green |

---

## 4. Root Cause Analysis (5-Whys)
1. **Why did user check-ins fail?**
2. **Why was the database unreachable?**
3. **Why did the primary node terminate?**
4. **Why did memory usage spike?**
5. **Why was there no bounded memory limit on that query?**

---

## 5. What Went Well / What Went Poorly
### What Went Well
- Automated failover completed within SLA.
- Runbook was accurate and easy to execute.

### What Went Poorly
- Alert was delayed by 3 minutes due to excessive group_wait.
- Dashboard was missing a specific saturation metric.

---

## 6. Action Items
| Action Item | Type | Owner | Due Date | Ticket |
|---|---|---|---|---|
| Implement query-budget timeout | Preventative | Jane Doe | YYYY-MM-DD | KF-1042 |
| Tune Alertmanager group_wait | Observability | John Smith | YYYY-MM-DD | KF-1043 |

