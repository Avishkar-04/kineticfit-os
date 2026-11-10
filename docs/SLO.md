# KineticFit OS - Service Level Objectives (SLOs) & Error Budget Policy

This document defines the quantitative Service Level Indicators (SLIs), Service Level Objectives (SLOs), error budgets, and feature freeze policies for KineticFit OS over rolling 30-day compliance windows.

---

## 1. Core User Journey SLOs (30-Day Rolling Windows)

| User Journey | Service Level Indicator (SLI) | SLO Target | 30-Day Error Budget | Business Impact of Violation |
|---|---|---|---|---|
| **API Availability** | Gateway non-5xx responses / Total requests | **≥ 99.9%** | ~43 minutes downtime | Members unable to load app or check timetable |
| **Turnstile Check-In Decision** | NFC/QR tap to gate unlock signal latency (p99) | **p99 < 150 ms (99.5%)** | ~0.5% slow taps | Physical queue bottleneck at gym entry turnstiles |
| **Read Latency (Schedules & Feeds)** | Public GET endpoint response time (p99) | **p99 < 500 ms (99.0%)** | 1% slow requests | Sluggish client timetable browsing experience |
| **Write Latency (Bookings & Updates)** | POST/PUT mutation response time (p99) | **p99 < 800 ms (99.0%)** | 1% slow requests | Delayed booking confirmation modal feedback |
| **Realtime Telemetry Freshness** | Turnstile badge tap event to UI presence tick | **p95 < 1.0 s (99.0%)** | 1% delayed ticks | Coach dashboard sees outdated athlete on-floor presence |
| **Booking Inventory Correctness** | Class oversold seat count | **EXACTLY 0 (100%)** | **0 oversells** | Coach turns athlete away at studio door |
| **Payment Webhook Processing** | Time from Stripe webhook arrival to invoice sync | **< 60 s (99.9%)** | 0.1% delayed | Member account locked due to false unpaid status |

---

## 2. Multi-Window Multi-Burn-Rate Alerting

We implement Google SRE multi-window burn rate alerts configured in `observability/prometheus/alerts.yml`:

| Burn Rate | Consumption Rate | Short Window | Long Window | Alert Severity | Pager Notification |
|---|---|---|---|---|---|
| **14.4x** | 2% budget consumed in 1 hour | 5 minutes | 1 hour | **SEV1** | PagerDuty immediately |
| **6.0x** | 5% budget consumed in 6 hours | 30 minutes | 6 hours | **SEV2** | PagerDuty business hours |
| **1.0x** | 100% budget consumed in 30 days | 6 hours | 3 days | **SEV3** | Jira reliability ticket |

---

## 3. Error Budget Policy & Deployment Freeze

The error budget is the maximum allowable unreliability (0.1% for 99.9% SLO).

### Policy Enforcement Rules:
1. **Budget Burn > 50% in a 7-Day Window**:
   - Automated CI gate freezes feature branch deployments to production.
   - Sprints pivot exclusively to reliability, technical debt, and resilience improvements.
2. **Budget Fully Exhausted (100% Burned)**:
   - Complete production deployment freeze (except emergency SEV1 security patches).
   - Mandatory postmortem review with Engineering Director and VP of Product.
3. **Thawing Mechanism**:
   - Feature deployments resume only after 7 consecutive days of 100% SLO compliance and completion of all P0 action items.
