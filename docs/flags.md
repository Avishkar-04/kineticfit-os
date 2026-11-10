# KineticFit OS - Feature Flags Catalog (Unleash / OpenFeature)

Feature flags enable safe progressive delivery, trunk-based development, and emergency circuit breakers. Every flag must have a designated owner and a strict expiration date to prevent technical debt.

---

## Active Feature Flags

| Flag Key | Type | Owner | Default (Prod) | Rollout Strategy | Expiry Date | Description |
|---|---|---|---|---|---|---|
| `new_timetable_view` | Boolean | `frontend-team` | `true` | 100% all users | 2026-12-31 | Interactive responsive weekly class schedule grid with studio filters. |
| `ai_meal_suggestions` | Boolean | `sports-sci-team` | `false` | Canary 20% | 2026-11-30 | AI-assisted macro meal recommendation algorithm in nutritionist workspace. |
| `kiosk_mode` | Boolean | `iot-platform-team` | `true` | Hub-based targeting | Permanent | Kiosk turnstile PIN & NFC scanning interface with restricted browser chrome. |
| `emergency_lockdown_ui` | Kill-Switch | `ops-director` | `false` | Global override | Permanent | Instant lockdown banner and turnstile freeze in case of physical safety hazard. |
| `waitlist_auto_promote` | Boolean | `backend-core` | `true` | 100% all hubs | 2026-12-15 | Automated optimistic promotion of next athlete on waitlist when a slot frees up. |
| `dashboard_v2_canary` | Percentage | `analytics-team` | `10%` | Canary 10% -> 50% | 2026-11-20 | New high-performance SVG chart engine for telemetry throughput. |

---

## Flag Lifecycle Rules

1. **Short-Lived by Default**: Experiment flags must be retired and removed within 60 days of release.
2. **Kill Switches**: Permanent flags (`emergency_lockdown_ui`) must be audited semi-annually and documented in runbooks.
3. **In-App Inspection**: Current state of all flags is inspectable in real-time under `/system` -> **Unleash Feature Flags** tab.

