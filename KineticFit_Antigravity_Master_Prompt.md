# KINETICFIT OS — MASTER BUILD PROMPT (single prompt, full scope)

> Paste this whole file into Antigravity (Planning mode, Agent Manager). Unzip the Stitch export into `/design/stitch_gym_management_portal/` first so you can open every `screen.png`, `code.html` and `kinetic_grid/DESIGN.md`.
> This is a **brand-new, standalone project**. Ignore any other project, repo, or earlier conversation context.

---

## 0. HOW YOU MUST WORK

You are a principal full-stack + platform engineer. Build **KineticFit OS**: a production-grade, animated, backend-connected gym management website, plus the platform/SRE engineering around it.

Operating rules:
1. **Plan first.** Produce an Implementation Plan artifact and a Task List artifact before writing code. Update them as you go.
2. **Decide, don't ask.** Make sensible decisions yourself. Log every assumption in `docs/ASSUMPTIONS.md` and every significant decision as an ADR in `docs/adr/NNNN-title.md`.
3. **Work in phases (Section 17).** Each phase ends with a **gate**: commands that must pass. Do not start the next phase until the gate is green. After each phase, produce a Walkthrough artifact with screenshots (use the browser agent) and commit with Conventional Commits.
4. **Visual fidelity check.** For every page ported from Stitch, open it in the browser agent at 1440×900, compare against the matching `screen.png`, and fix differences in spacing, color, type, and density. Keep a side-by-side in the walkthrough.
5. **No fake finished product.** No lorem ipsum, no hard-coded numbers in the UI, no `TODO` left in shipped code. Every number on every screen must come from the API (real, derived, or clearly-labelled simulated telemetry; see Section 7.4). Mock data is allowed only in tests/Storybook (MSW).
6. **Honesty over theatre.** Section 16 has a 111-item traceability matrix. Each item must be tagged **IMPLEMENTED** (running code + test), **CONFIGURED** (real config/manifest, validated), or **DEMONSTRATED** (script/experiment + written result, because true production scale is impossible locally). Never claim an item is done without the evidence file listed. Maintain `docs/TRACEABILITY.md` and keep it truthful.
7. **Runs on a laptop.** `docker compose --profile core up` must work on 16 GB RAM. Other profiles (`full`, `chaos`, `ha`) add more. Kubernetes runs locally on `kind`.
8. **Security by default.** Never commit secrets. Ship `.env.example` only.

Tech stack (fixed, don't re-debate):
- **Frontend:** React 18 + TypeScript (strict) + Vite, Tailwind CSS (build-time, **not** the CDN script), Framer Motion, TanStack Query/Table/Virtual, React Router (data routers, lazy routes), Zustand, react-hook-form + zod, Recharts + custom SVG, `openapi-typescript`/Orval generated API client, vite-plugin-pwa (member portal), Vitest, Playwright, Storybook.
- **Backend:** Node.js 22 + TypeScript + NestJS, monorepo with pnpm + Turborepo. PostgreSQL 16, Drizzle ORM + drizzle-kit migrations, PgBouncer, Redis 7, RabbitMQ 3.13 (quorum queues, DLX, delayed retry), MinIO (S3 API), gRPC (internal), REST/OpenAPI 3.1 (external), WebSocket + SSE + long-polling.
- **Edge/Platform:** Nginx (reverse proxy, TLS, WAF via ModSecurity + OWASP CRS), Kong OSS (API gateway), Docker, Kubernetes (kind locally), Helm, Terraform, Argo Rollouts, KEDA, CloudNativePG, cert-manager, External Secrets + Vault (dev), Unleash (feature flags), GitHub Actions.
- **Observability:** OpenTelemetry → Tempo/Jaeger (traces), Prometheus (metrics), Loki (logs), Grafana (dashboards as code), Alertmanager, blackbox-exporter, k6 (load).

---

## 1. PRODUCT

**KineticFit OS** is a multi-branch ("Hub") gym operating system for elite fitness clubs: member registry, class scheduling with capacity/waitlists, diet & nutrition protocols, trainers/staff, billing, RFID/turnstile check-in with live floor telemetry, and a member self-service portal.

Tenancy: `organization` → many `hubs` (branches; design shows the "Active Hub: Downtown Flagship" switcher). Every business row carries `org_id` and `hub_id`. Hub capacity (design: 300), timezone, and currency are **per-hub config** (design hard-codes PST and `$`; do not hard-code).

### 1.1 Roles (design only shows the Ops Director; build all)
| Role | Scope | Notes |
|---|---|---|
| `SUPERADMIN` | org-wide | Hubs, roles, feature flags, system status, audit |
| `OPS_DIRECTOR` | hub(s) | The persona in the designs (Marcus Vance). Tier-1 overrides (lockdown, bypass) |
| `FRONT_DESK` | one hub | Check-in, register athlete, manual bypass requests |
| `TRAINER` | own clients/classes | Schedule, clients, log assessments, cover requests |
| `DIETITIAN` | hub | Diet protocols, assignments, consult queue |
| `FINANCE` | hub/org | Billing, refunds, ledger (view & export only per design) |
| `MEMBER` | self | Member portal only |

Authorization = RBAC + ABAC (hub scope, ownership, tier) via CASL on the server; UI hides what the server would deny, but the **server is the authority**.

### 1.2 Canonical naming (the design is inconsistent, fix it everywhere)
- Membership tiers (enum `STANDARD | PRO | ELITE_BLACK`): display "Standard Gym / Pro Performance / Elite Black VIP". Designs variously say "Foundational", "Pro Athlete", "Black VIP", "Elite"; unify. Prices are plan rows in the DB (design: 129 / 199 / 289 per month), never literals in components.
- Coach "Elena Rostova" (schedule, members, diet) vs "Elena Rivera" (dashboard): use **Elena Rostova**.
- Pages show different occupancy bases (`222/300` vs `148/200`): occupancy comes from one source (Redis counter + DB snapshot) and every widget reads that same value.
- Diet-plan counts differ between dashboard (Weight-loss 243 of 640) and diet hub (Fat-loss 312): compute from `diet_assignments` only.

---

## 2. DESIGN VERIFICATION (done by me, fix every item)

I opened all 8 Stitch screens, `DESIGN.md`, and the HTML. Verdict: **strong, coherent visual system; ready to build after the corrections below.**

### 2.1 What exists (8 files → 7 unique screens)
| Stitch folder | Becomes route | Notes |
|---|---|---|
| `executive_dashboard` **and** `kineticfit_os_gym_management_dashboard` | `/dashboard` | **Byte-identical duplicates.** Use one. |
| `members_directory_profiles` | `/members` (+ side panel) | Needs full member page |
| `class_schedule_timetable` | `/schedule` | Weekly grid + "Telemetry Inspector" |
| `diet_nutrition_plans_by_category` | `/nutrition` | Hub with protocol detail |
| `ops_director_settings_account_security` | `/settings/*` (modal over app **and** deep-linkable routes) | 4 tabs |
| `member_portal_login_athlete_registration` | `/auth` (Sign in / Register tabs, kiosk style) | Rich version |
| `simple_clean_member_login` | `/auth` compact/mobile variant | Merge with the rich one (one auth system, two layouts) |
| `kinetic_grid/DESIGN.md` | design tokens | See 2.3 |

Sidebar lists **Trainers & Staff** and **Financials & Billing** but **no screens exist** → you must design and build them (Section 5).

### 2.2 Defects found in the Stitch output (all must be fixed)
1. **Broken logo image** on all 6 app screens (alt text "KineticFit Logo" visible). Replace with an inline SVG bolt mark + wordmark `KINETIC` (white) `FIT` (lime), as the login pages already do.
2. **Invalid icon name rendered as text**: dashboard shows `FITBIT_PUSH_UPS` next to "Book Personal Trainer". Use a valid icon (`person_add`/`fitness_center`). Self-host the icon font or use `lucide-react`; do not depend on Google Fonts CDN at runtime.
3. **Truncated/clipped content**: athlete names ("Aria Ste…", "Marcus T…", "Alex Ri…"), the members table's right-most **Diet & Nutrition Plan** column is cut off, the timetable's Sat/Sun columns overflow, coach names are cut on timetable cards, the diet category chip row is cut. Fix with proper min-widths, `truncate` + tooltip, horizontal scroll with sticky first column, and responsive column priority.
4. **Settings modal is clipped**: header/profile block is cut and only one policy row is visible. Rebuild as: fixed header, fixed tab bar, **scrollable body**, fixed footer (Discard / Save), max-height `min(88vh, 860px)`, focus-trapped, `ESC` closes, route-synced.
5. **Simple login**: "Sign Up" button text wraps onto two lines; card sits low with large empty space; Sign In appears cut at the bottom. Center the card vertically, fix button `whitespace-nowrap`.
6. **Login says "verified@gmail.com required"** and "Gmail address". Do **not** restrict to Gmail. Accept any valid email (verified by emailed link), and offer "Continue with Google" via OAuth2/OIDC + PKCE.
7. **Unverifiable trust claims** ("SOC2 Type II verified", "ISO/IEC 27001", "HIPAA certified", "99.99% SLA", "256-bit hash token", "1.4 ms gateway latency (zero churn)"). Do not ship false compliance claims. Replace with live, real values (actual TLS version, measured gateway latency) or remove the badges. Add a code comment pointing to this item.
8. **Hard-coded 2025 dates** (Oct 20–26 2025, InBody scan Oct 18 2025, "last rotated 14 days ago"). All dates dynamic, hub-timezone aware, `Intl` formatted.
9. **Timezone label "PST-08"** and `$` hard-coded → per-hub `timezone` and `currency`.
10. **Naming/number inconsistencies** (Section 1.2).
11. **Two sources of color truth**: `DESIGN.md` front-matter tokens (`background #111319`, `primary-container #c3f400`, `secondary-container #00eefc`, `surface-container-* #191c21/#1d2025/#272a30/#32353b`, `outline-variant #444933`, `error #ffb4ab`) **differ** from its prose (`#0c0f14`, `#ccff00`, `#00f0ff`, `#262f3e`). The generated HTML uses the **front-matter** tokens. **Rule:** front-matter tokens are the source of truth; implement them as CSS variables with semantic aliases (`--kf-bg`, `--kf-surface-1..3`, `--kf-lime`, `--kf-cyan`, `--kf-danger`, `--kf-border`). Keep the prose's *behavioral* rules (borders instead of shadows, tonal elevation, lime glow on focus, pill chips only for status).
12. **Tailwind via CDN script + remote Google-hosted avatar URLs** (expire/unreliable). Use build-time Tailwind, self-hosted fonts (Plus Jakarta Sans, Inter, JetBrains Mono), and seeded avatars stored in MinIO (generated initials fallback, which the design already uses for "AR", "TA", "EW").
13. **Accessibility gaps**: 11–12 px mono text on dark with low-contrast tertiary greys, color-only status, tiny hit targets (check-in "Check In" pills), no visible focus order. Target **WCAG 2.2 AA**: min 12 px (prefer 13), contrast ≥ 4.5:1 for text (lift tertiary text colors), every status chip has text/icon not only color, hit targets ≥ 32 px (44 px on touch), `prefers-reduced-motion` honored.
14. **Desktop-only designs.** No tablet/mobile states exist. Implement per `DESIGN.md` breakpoints: ≥1280 desktop 12-col, 768–1279 tablet 8-col (sidebar collapses to icon rail), <768 mobile 4-col (sidebar → bottom tab bar + drawer; tables → card lists; timetable → day view with swipe; side panels → full-screen sheets).
15. **Settings shows "Audio Chime", YubiKey FIDO2, session kill** etc. These are real features: implement WebAuthn (FIDO2) + TOTP, session list/terminate (Section 8).

### 2.3 Design system essentials (from `kinetic_grid/DESIGN.md`, "Kinetic Grid")
- Dark "technical minimalism + industrial athleticism". Electric lime reserved for actions, active states, top metrics. Cyan for velocity/telemetry/utilization.
- Fonts: **Plus Jakarta Sans** (display/headlines, 700–800), **Inter** (body), **JetBrains Mono** (labels, IDs, numbers, table headers, timestamps; `label-caps` 11px, 0.08em tracking, uppercase).
- Type scale: display-hero 48/52, headline-lg 30/36, headline-md 22/28, headline-sm 18/24, body-lg 16/24, body-md 14/20, body-sm 12/16, metric-xl 36/40 800, metric-md 24/28, data-mono 13/16.
- Radius: 4px primitives, 8px cards, pills only for status chips and progress tracks.
- Spacing base 4px; gutters 16 (mobile/tablet) / 24 (desktop); margins 16/24/32; sidebar 260px; table rows 44px; 1px border-based grid with zero-gap data grids.
- Elevation = tonal tiers + 1px borders (no soft drop shadows). Hover: next surface tier + brighter border. Focus/critical: lime glow `0 0 16px rgba(195,244,0,.15), inset 0 0 0 1px lime`. Cyan telemetry glow `0 0 12px rgba(0,238,252,.18)`. Modals: 80% scrim + `backdrop-filter: blur(8px)`.
- Components: Primary (lime bg, dark text, 600), Secondary (outline), Ghost; KPI card (label-caps + chip, metric-xl, delta badge); progress rings (SVG, 4–6px stroke); badge chips (Active/Checked-in = lime tint, In-session/Capacity = cyan tint, Past-due/Flagged = red tint); dense tables; inputs with lime focus border + halo; lime checkboxes/radios/toggles.
- Build these as a documented component library in `packages/ui` with Storybook, including all states (default, hover, focus, active, disabled, loading, error, empty).


---

## 3. ARCHITECTURE

```
 Browser (React SPA/PWA)
    │  HTTPS (HTTP/2, optional HTTP/3), WS, SSE
    ▼
 CDN / Edge cache  (static assets, public schedule; local: Nginx cache emulating CDN)
    ▼
 Nginx reverse proxy  (TLS 1.2/1.3, HSTS, gzip/brotli, ModSecurity + OWASP CRS WAF, conn/req limits)
    ▼
 Kong API Gateway  (JWT/JWKS verify, rate limiting, CORS, request-id, versioned routes /v1, /v2, canary routing)
    ▼───────────────┬──────────────┬───────────────┬──────────────┬──────────────┬───────────────┐
 auth-service   member-service  scheduling-svc  nutrition-svc  billing-svc   access-svc      notification-svc
 (IAM/OAuth/    (members,       (classes,       (diet, meals,  (plans,       (check-ins,     (email/push/in-app,
  MFA/sessions)  memberships,    bookings,       assessments,   invoices,     turnstile,      webhooks out, SSE/WS
                 trainers/staff) waitlist)       InBody)        payments)     occupancy, WS)  fan-out)
     │ gRPC (deadlines, retries, circuit breakers) between services; async events via RabbitMQ
     ▼
 PostgreSQL (db-per-service, primary + streaming replica) ← PgBouncer      Redis (cache, rate-limit, locks, presence, WS adapter)
 RabbitMQ (topic exchange, quorum queues, retry + DLX)                     MinIO (avatars, exports, backups, archives)
 worker (consumers) · scheduler (cron, leader-elected) · telemetry-simulator · fn-pdf-export (serverless-style)
 Observability: OTel Collector → Tempo/Jaeger · Prometheus · Loki · Grafana · Alertmanager · blackbox
```

Rules:
- Each service owns its schema; **no cross-service DB reads**. Cross-service data via gRPC (sync, read-mostly) or events (async).
- **Transactional outbox** for every published event; **inbox/dedup table** in every consumer (effectively-once processing).
- Services are stateless (state in Postgres/Redis) so they scale horizontally; graceful shutdown on SIGTERM.
- Shared contracts live in `packages/contracts` (protobuf, OpenAPI, zod event schemas with `schemaVersion`).

### 3.1 Event catalog (topic exchange `kf.events`, routing key `<domain>.<event>.v1`)
`member.registered`, `member.updated`, `membership.activated|expiring|expired|frozen`, `class.created|updated|cancelled`, `booking.requested|confirmed|rejected|cancelled`, `waitlist.promoted`, `checkin.recorded|denied`, `occupancy.changed`, `diet.assigned|updated`, `assessment.logged`, `invoice.issued|paid|failed|refunded`, `payment.webhook.received`, `notification.requested|sent|failed`, `lockdown.engaged|released`, `audit.recorded`.

### 3.2 Sagas (orchestrated, state persisted in `saga_instances`, with compensations, timeouts, and DLQ)
1. **Athlete Registration Saga** (`member.registration`): create auth user → create member + RFID binding → create membership (PENDING) → issue first invoice/charge → on success activate membership + send welcome; on payment failure compensate (cancel membership, release RFID, disable user, mark invoice void, notify).
2. **Class Booking Saga** (`booking.create`): validate eligibility (membership active, tier, no overlap) → reserve seat (atomic capacity decrement) → (if drop-in/PT) authorize payment/credit → confirm + notify; on failure release seat and promote next waitlisted member.
3. **Membership Renewal Saga** (cron-initiated): charge → retry with dunning schedule → freeze/lapse + notify.
Each saga step is idempotent, has a timeout, and emits metrics (`saga_step_duration`, `saga_compensations_total`). Provide a saga viewer in the admin System page.

---

## 4. REPOSITORY LAYOUT (create exactly this, adjust only with an ADR)

```
kineticfit/
├─ apps/
│  ├─ web/                    # React app (admin + trainer + member portals, role-based shells)
│  ├─ auth-service/ member-service/ scheduling-service/ nutrition-service/
│  ├─ billing-service/ access-service/ notification-service/
│  ├─ worker/                 # queue consumers (shared libs, per-domain handlers)
│  ├─ scheduler/              # cron jobs, leader-elected
│  ├─ telemetry-simulator/    # turnstile/RFID/sensor event generator (rate-controllable)
│  └─ fn-pdf-export/          # stateless function container (PDF/CSV export), serverless-compatible
├─ packages/
│  ├─ ui/ (design system + Storybook)  ├─ contracts/ (proto, openapi, zod events)
│  ├─ config/ (eslint, tsconfig, tailwind preset)  ├─ observability/ (otel, pino, metrics helpers)
│  ├─ resilience/ (timeout, retry+backoff+jitter, circuit breaker, bulkhead, idempotency, rate-limit libs)
│  └─ testing/ (testcontainers helpers, factories, fake clock)
├─ db/ (migrations per service, seed/, partition scripts)
├─ deploy/
│  ├─ compose/ (docker-compose.yml, profiles: core|full|chaos|ha)
│  ├─ nginx/ (nginx.conf, modsecurity/, crs/)  ├─ kong/ (declarative kong.yml)
│  ├─ k8s/ (kustomize base + overlays: dev|staging|prod)  ├─ helm/kineticfit/ (chart per above)
│  ├─ terraform/ (modules: kind-local, aws-reference)  └─ argo/ (rollouts, analysis templates, appsets)
├─ observability/ (prometheus rules, alerts, grafana dashboards JSON, loki, tempo, otel-collector)
├─ load/ (k6 scripts)  ├─ chaos/ (toxiproxy, chaos-mesh experiments, game-day scripts)
├─ docs/ (ARCHITECTURE.md, TRACEABILITY.md, ASSUMPTIONS.md, adr/, runbooks/, postmortems/, slo.md, oncall.md, dr.md, cost.md)
├─ .github/workflows/  └─ Makefile (make up|down|seed|test|e2e|load|chaos|kind-up|deploy|rollback)
```

---

## 5. PAGES & SCREENS (complete inventory)

Legend: **[S]** = exists in Stitch (port pixel-faithfully, then fix 2.2) · **[N]** = new, you design in the same Kinetic Grid language, same density and component vocabulary.

Global app shell **[S]**: left sidebar (260px; hub switcher, nav, "Floor Live Saturation 74%" mini-widget, version), top bar (global search with `Ctrl/Cmd+K` command palette, **Fast Check-in** button, live Occupancy pill, notifications bell with unread dot, user menu). Nav differs by role. Sidebar items: Dashboard · Members Directory · Class Schedule · Diet & Nutrition · Trainers & Staff · Financials & Billing, plus **[N]** Access & Check-ins · Reports · Announcements · Facilities · System (SUPERADMIN/OPS).

### 5.1 Auth & onboarding
| Route | Src | Spec |
|---|---|---|
| `/auth` | [S] | Rich "Athlete & Staff Access Portal" with tabs **Sign in / Create account**, live club telemetry panel (real occupancy, trainers on floor, next session countdown, announcement), "Continue with Google", "Tap RFID/Apple GymKit" (Web NFC where available, otherwise kiosk RFID-reader keyboard-wedge input), password strength checklist (8+ chars, number, symbol; live), tier picker with real plan prices, terms checkbox, show/hide password, remember-me (30 days via rotating refresh cookie). Compact variant (the "simple login") is used on mobile and as a `?compact=1` layout. |
| `/auth/forgot`, `/auth/reset/:token` | [N] | Email link flow; always-same response to prevent user enumeration |
| `/auth/verify/:token` | [N] | Email verification |
| `/auth/mfa` | [N] | TOTP and WebAuthn (YubiKey) challenge; recovery codes |
| `/auth/invite/:token` | [N] | Staff invite acceptance (set password, MFA enrol) |
| `/kiosk` | [N] | Full-screen front-desk RFID/QR check-in terminal, big feedback states (granted/denied/expired), auto-reset in 3s |
| `/403 /404 /500 /offline /maintenance` | [N] | On-brand error pages with request-id for support |

### 5.2 Dashboard `/dashboard` [S] (Ops Director, Trainer-lite)
Port every block: **Live Telemetry Stream strip** (refresh interval from settings, node id, Peak surge forecast, *Broadcast PA*, *Sync RFID Nodes* actions) · **5 KPI cards** (Active Athletes + MoM delta + target; Today's Check-ins + peak time + turnstile A/B; Current MRR + delta + expected; Diet & Coaching enrolled + % of roster; Class Fill Rate + sessions + waitlist) · **Rapid Terminal Dispatch** (Quick Check-in, Assign Diet Chart, Book Personal Trainer, New Member Registration, each opens its modal/wizard) · **Live Gym Floor Saturation** (animated ring, on-site count, peak-window forecast, air-quality index, avg dwell; 4 sector congestion cards: Free Weights, Recovery/Cold Plunge/Sauna, Cardio Deck, Functional Turf) · **Live Turnstile Stream** (WebSocket feed, newest slides in at top) · **Diet Program Distribution** (segmented bar + 4 tiles + Dietitian Consult Queue) · **High-Demand Classes Today** · **Trainers & Specialists on Duty**.
Each KPI is clickable → drill-down route with filters pre-applied. Every widget has loading skeleton, error state with retry, empty state, and "as of HH:MM:SS" freshness stamp.

### 5.3 Members `/members` [S] + `/members/:id` [N]
- Segment tabs: All / Active / Expiring / Frozen with live counts; search by name, RFID UID, phone, token (debounced, server-side, `pg_trgm` + indexed exact match on RFID/ID); filters (Access Tier, Diet Plan, more: trainer, join date, status); bulk select → **Bulk Trainer assign**, **Export CSV** (async job → file in MinIO → notification), **+ Register Athlete** (wizard modal [N]: identity → contact → tier & plan → trainer & diet → RFID bind → payment → review; runs the Registration Saga).
- KPI strip: VIP capacity occupancy, diet protocol compliance, renewals expiring <7 days (action required), floor saturation.
- Table: checkbox, athlete (avatar/initials, name, member ID `KF-####`, RFID, status chips ACTIVE/EXPIRES 5D/TOP 5%), tier chip, assigned trainer, diet & nutrition plan (name, kcal, adherence), more columns user-selectable. **Keyset pagination + virtualization** for 1,842+ rows (design shows "Page 1 of 307" style; support page-size and jump).
- Right **detail panel**: avatar, status, hub, trainer; **InBody composition** card (body fat, muscle mass, BMI, 30-day delta, progression sparkline); **diet phase** card (protein target vs actual, weekly sessions bars, compliance %); **Next milestone check-in**; actions **Log Assessment** and **Adjust Macros** (open forms). Opens full page `/members/:id`.
- `/members/:id` [N] tabs: Overview · Membership & Billing · Bookings & Attendance · Nutrition · Progress (charts: weight, body fat, muscle, PRs) · Access log · Documents (waivers, uploaded to MinIO) · Notes (trainer/staff, private) · Audit.

### 5.4 Class Schedule `/schedule` [S]
Week navigator (prev/next/Today, week number), **Weekly Velocity / Studio Fill Rate / Waitlist Total** KPIs, actions **Cover Request**, **Export PDF** (via fn-pdf-export), **+ Add Session** (modal [N]: template, studio, coach, recurrence RRULE, capacity, equipment, tier restrictions, waitlist rules). Filters: Zone chips (All, Studio 1 MetCon, 2 Yoga, 3 Cycle, 4 Oly Lifting; dynamic from DB), Coach dropdown, Category chips (Strength, Cardio, Mobility, Recovery, Boxing). 7-day grid with hour rows; cards show time, status tag (ALMOST FULL / WAITLIST: n / ACTIVE FOCUS / LOCKED / OPEN), name, studio • coach, `booked/capacity`, fill bar. Clicking a card fills the **Telemetry Inspector** (bottom/side): studio+time, title, description, coach with **Substitute**, Capacity and Waitlist tiles (Auto-promote active), **Confirmed Athletes** list with per-row **Check In**, **Check All In**, waitlist row with **Auto-Next**, **Equip Allocation** chips, **Broadcast Push** and **Launch RFID**. Drag a class to another slot to reschedule (optimistic update, rollback on conflict via version check). Realtime: roster/check-in/waitlist updates stream in. Print stylesheet for the inspector.

### 5.5 Diet & Nutrition `/nutrition` [S] + sub-pages [N]
Header + **Export Meal Guide PDF** + **+ Create New Diet Protocol**. Category chips (All, Weight Loss & Deficit, Muscle Hypertrophy & Bulk, Keto & Low Carb, Athletic Endurance…) with counts; filter-as-you-type. Protocol cards (name, kcal range, macro split, enrolled count, tier tag, ACTIVE DEPLOYMENT). Selected protocol **specification** (kcal, protein, carbs, fats, hydration), **Macro Calibration** ring + micronutrient thresholds, **Daily Chrono-Nutritional Timeline** (meals with time, tags, macros, prep notes), **Ergogenic Stack** (supplements with timing/status), **Assigned Athletes** (adherence %, trend) with **Update Diet Targets for Roster**, plus "Kitchen Lab Protocol" and "Physiological Rule" notes.
New: `/nutrition/protocols/new|:id/edit` (macro calculator with live ring; meal builder with drag-reorder; ingredient/food library; versioned protocols, published/draft) · `/nutrition/assignments` (bulk reassign with preview + undo) · `/nutrition/consults` (dietitian queue, bi-weekly reviews, notes, approve/adjust) · `/nutrition/foods` (food DB with macros).

### 5.6 Trainers & Staff `/staff` [N] (design this)
Directory (cards + table toggle: photo, role, specialty, status On Floor/Off/On Leave, floor zone), shift roster calendar (drag-to-assign, conflict detection, coverage heatmap), **Cover Requests** inbox (approve → auto-substitutes classes via saga), trainer detail `/staff/:id` (bio, certifications with expiry alerts, clients, class load, utilization ring, ratings, PT availability/booking slots), invite staff, role assignment. "Trainers & Specialists on Duty" on the dashboard links here.

### 5.7 Financials & Billing `/billing` [N] (design this)
Tabs: **Overview** (MRR, ARR, churn, ARPU, collection rate, revenue by tier/hub, 12-month trend, forecast vs `$100K` target style gauge) · **Invoices** (table: status Paid/Open/Past due/Void, filters, bulk remind, export) · **Subscriptions** (active/paused/cancelling, plan change, proration preview) · **Payments & Refunds** (provider reference, partial refunds with idempotency key, disputes) · **Dunning** (past-due queue, retry schedule, flagged athletes) · **Plans & Pricing** (CRUD plans, effective dating, feature flags per plan) · **Ledger export** (CSV/PDF, view & export only per the Settings policy). Payment provider abstraction `PaymentProvider` with adapters: `MockProvider` (default, deterministic failure injection), Stripe test-mode, Razorpay test-mode; signed webhooks.

### 5.8 Access & Check-ins `/access` [N]
Full live turnstile log (virtualized, filter by gate/tier/result), gate/lane health (Lane 01 Biometric East, 02 Turnstile RFID, 03 VIP Lift Pod: PASS/STANDBY), denied-entry review with manual bypass (permission-gated, reason required, audited), **Emergency Turnstile Lockdown** (Tier-1; two-person confirm + MFA step-up; engages via event to all gates; big banner everywhere), occupancy history chart with hourly heatmap.

### 5.9 Settings `/settings/:tab` [S] (modal over app, plus deep link)
Header: breadcrumbs `KineticFit OS / Name / Settings`, profile block (avatar, name, role chip, RFID id, hub, last sync, Edit Bio/Role, Change Master Keycard PIN, Keycard Log download).
- **Account & Security** (Section 01 Operational Privileges & Overrides: 6 policy toggles with Tier badges, waitlist promotion grace minutes; Section 03 Credentials: MFA (TOTP + WebAuthn/YubiKey), master passphrase rotate, **Active Sessions table** with Terminate and Kill-all-others).
- **System & Theme** (Color engine profile: Kinetic Volt Dark / Cyber Slate / Midnight Black; primary accent picker; telemetry stream interval 1.2s/3s/5s; audio chime on turnstile conflict) → persisted per user, applied via CSS variables with animated transition.
- **Operational Permissions** (role × capability matrix editor, hub scopes).
- **Audit & Sessions** (searchable immutable audit log: who/what/when/IP/diff).
Footer: node signature, **Discard Changes**, **Save Preferences & Sync Node** (dirty-state aware, optimistic, toast + undo).

### 5.10 Other new staff pages
`/reports` (attendance, retention cohorts, class popularity, revenue, diet adherence; scheduled report emails; export) · `/announcements` (compose, audience targeting, schedule, push/in-app/email, delivery stats) · `/facilities` (equipment inventory, maintenance tickets, locker assignments, sector capacity config) · `/system` (SUPERADMIN: service health, queue depths, **DLQ viewer with inspect/replay/discard**, saga viewer, feature flags, deployment info, SLO/error-budget widgets, webhook delivery logs).

### 5.11 Member portal `/me/*` [N] (user profile pages live here)
`/me` Home (today's pass QR, next booking, streak, today's meals, quick book) · `/me/profile` **User Profile** (avatar upload, personal info, emergency contact, goals, health notes (encrypted), units, language, communication preferences, data export & delete-account request, connected accounts) · `/me/membership` (plan, renewal, upgrade/downgrade with proration, freeze, cancel with retention flow, invoices, payment methods) · `/me/classes` (browse, book, join waitlist, cancel, calendar `.ics` export) · `/me/bookings` · `/me/nutrition` (today's timeline, log meals/water, adherence ring, swap suggestions) · `/me/progress` (InBody scans, charts, PRs, photos) · `/me/trainer` (assigned trainer, book PT slot, message) · `/me/pass` (rotating QR/NFC digital pass; works offline for 60s windows) · `/me/notifications` · `/me/security` (password, MFA, sessions, devices). PWA: installable, offline-capable schedule/pass, background sync for queued bookings.

### 5.12 Trainer workspace `/coach/*` [N]
`/coach` today view · `/coach/clients` · `/coach/clients/:id` (log assessment, macros, notes) · `/coach/schedule` · cover requests. Reuses staff components, restricted by ABAC (own clients only).

### 5.13 Public site `/` [N]
Landing: hero with live "right now" occupancy, plans & pricing (from API, CDN-cacheable), public timetable teaser, trainers, CTA to Register. SSR/prerender not required; must be Lighthouse ≥ 90 perf/a11y/best-practices/SEO.

---

## 6. FRONTEND ENGINEERING & MOTION

Architecture: route-level code splitting; role-based route guards; TanStack Query (stale-while-revalidate, request de-dupe, `AbortController`, retries with exponential backoff + jitter for idempotent GETs only, optimistic mutations with rollback, query persistence); a single **realtime client** with transport negotiation **WebSocket → SSE → long-polling**, auto-reconnect with backoff, last-event-id resume, heartbeat, and visibility-aware pause; global error boundary + toast system; i18n-ready strings; all forms zod-validated and mirrored by server validation; generated typed API client from OpenAPI; idempotency key generated per mutation attempt.

Performance budgets (CI-enforced): initial JS ≤ 180 KB gz for auth/landing, ≤ 300 KB gz for app shell; LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on a mid-range profile; tables virtualized; images lazy + sized; fonts `font-display: swap` + preloaded subsets.

Motion language ("kinetic, precise, never sluggish"): durations 120–280 ms, ease `cubic-bezier(.2,.8,.2,1)`, springs only for sheets/modals. Animate **transform/opacity only**; `prefers-reduced-motion` disables non-essential motion.
- Route transitions: shared shell stays; content cross-fades + 8px rise; sidebar active indicator slides between items (shared `layoutId`).
- Count-up on KPI values (tabular-nums, no jitter), delta badges pop; ring sweeps animate from 0 on mount and tween on updates; fill bars grow; sparkline draws on.
- Lists: staggered entrance (30 ms), turnstile stream rows slide in from top with a 600 ms lime flash, removed rows collapse.
- Timetable: card hover lift (border brighten + 2px), selected card gets the lime glow, inspector content cross-fades with a height-animated container; drag ghost with snap preview.
- Modals/drawers/sheets: scrim fade + blur, panel spring; focus-trapped; ESC closes.
- Skeleton shimmer loaders matching final layout (no layout shift); button pending states with inline spinner; success check morph; toasts slide/stack.
- Tabs: animated underline/pill; theme change cross-fades CSS variables.
- Auth page: terminal-style boot sequence on first load (status lines resolve to "TERMINAL ONLINE") limited to <900 ms and skippable; password checklist items tick with a micro-animation.
- Emergency lockdown: whole-app red banner slides in, gate indicators flip, audible chime if enabled.


---

## 7. DATA, API, REALTIME

### 7.1 Core tables (per owning service; all have `id uuid v7`, `org_id`, `hub_id`, `created_at`, `updated_at`, `version int` for optimistic locking, soft-delete where legal retention needs it)
- **auth:** `users`, `credentials` (argon2id), `mfa_factors` (totp/webauthn), `sessions` (family id, device, ip, last_seen), `refresh_tokens` (hashed, family, used_at), `signing_keys` (kid, alg, status), `roles`, `role_permissions`, `user_roles`, `oauth_identities`, `api_clients`.
- **member:** `members` (member_no `KF-####`, rfid_uid unique, tier, status, trainer_id, dob, phone_enc), `memberships`, `staff`, `staff_certifications`, `shifts`, `cover_requests`, `member_notes`, `documents`.
- **scheduling:** `studios`, `class_templates`, `class_sessions` (starts_at, ends_at, capacity, booked_count, waitlist_count, status, version), `bookings` (unique `(session_id, member_id)` where active), `waitlist_entries`, `equipment_allocations`.
- **nutrition:** `diet_protocols` (versioned), `protocol_meals`, `meal_items`, `foods`, `supplements`, `diet_assignments`, `meal_logs`, `body_assessments` (InBody: body_fat, muscle_mass, bmi, source, scanned_at), `consult_queue`.
- **billing:** `plans`, `plan_prices` (effective-dated, currency), `subscriptions`, `invoices`, `invoice_lines`, `payments`, `refunds`, `payment_methods` (tokens only), `webhook_events` (provider event id unique), `ledger_entries` (append-only), `dunning_attempts`.
- **access:** `check_ins` (**range-partitioned by month on `occurred_at`**), `gates`, `access_denials`, `occupancy_snapshots`, `lockdown_events`, `rfid_nodes`.
- **notification:** `notifications`, `delivery_attempts`, `webhook_subscriptions`, `webhook_deliveries`, `announcements`.
- **platform (shared per service):** `outbox`, `inbox_dedup`, `idempotency_keys` (key, request_hash, response, expires_at), `saga_instances`, `audit_log` (**partitioned by month**, append-only, hash-chained).

### 7.2 Index & query rules (write them, then prove with `EXPLAIN (ANALYZE, BUFFERS)` saved under `docs/perf/`)
- Composite indexes matching access paths, e.g. `members(hub_id, status, tier)`, `members(hub_id, lower(name) gin_trgm_ops)`, `class_sessions(hub_id, starts_at)`, partial `bookings(session_id) WHERE status='CONFIRMED'`, `check_ins(hub_id, occurred_at DESC)` per partition, `invoices(hub_id, status, due_at)`, `outbox(published_at) WHERE published_at IS NULL`.
- Keyset pagination (`WHERE (sort_col, id) > ($1,$2)`), never deep `OFFSET`.
- **N+1 prevention:** DataLoader-style batching for any nested resolution; lint rule + integration test using a query-counter that fails if an endpoint exceeds its query budget (e.g. `/members` list ≤ 3 queries for 50 rows, `/schedule/week` ≤ 4).
- Slow-query log + `pg_stat_statements`; dashboard of top queries; `auto_explain` in dev.
- **Connection pooling:** PgBouncer (transaction mode) in front of every DB; app pool size formula documented (`pool = ceil(cores*2 + spindles)` per instance, capped by PgBouncer limits); prepared-statement compatibility handled.
- **Read replicas:** one streaming replica (compose profile `ha`, CloudNativePG in k8s). Read/write splitting in `packages/resilience/db`: lists, reports, dashboards → replica; read-your-writes via "pin to primary for 3 s after a write by this session" (or LSN wait). Expose replica lag metric; if lag > 5 s, reads fall back to primary.
- **Partitioning:** monthly range partitions for `check_ins` and `audit_log`, created ahead by cron, old partitions detached/archived to MinIO per retention (check_ins 24 mo hot, audit 7 y).
- **Sharding:** shard key = `hub_id` (document why not `member_id`). Implement a shard-router abstraction (consistent hashing, shard map table) used by `access-service`; default 1 shard; `ha` profile runs 2 shards to **demonstrate** routing, cross-shard fan-out for org-level reports, and a re-balancing runbook. Tag DEMONSTRATED.

### 7.3 Consistency, CAP, locking (write `docs/consistency.md` + ADR)
- **CP** for money, bookings, auth, capacity (single-primary Postgres, serializable/`FOR UPDATE` where needed, fail closed on partition).
- **AP / eventual** for dashboards, KPI read-models, occupancy display, notifications, search suggestions, cache (UI shows "as of" stamps; rollups reconcile nightly).
- **Seat booking correctness** (race-condition showpiece): atomic `UPDATE class_sessions SET booked_count = booked_count+1 WHERE id=$1 AND booked_count < capacity` plus unique `(session_id, member_id)`; test: **200 concurrent requests for 12 seats → exactly 12 confirmed, 188 waitlisted/rejected, counts consistent**.
- **Optimistic locking:** `version` column on sessions, protocols, members, settings; `If-Match`/ETag on updates; 409 with current state → UI offers merge/reload.
- **Pessimistic locking:** `SELECT … FOR UPDATE SKIP LOCKED` for waitlist promotion and outbox/job claiming; `lock_timeout` and `statement_timeout` set per role.
- **Deadlocks:** consistent lock ordering (documented), short transactions, catch `40P01`/`40001` and retry with jitter; a deliberate-deadlock test proves recovery.
- **Distributed locks:** Redis `SET key token NX PX` with **fencing tokens**, renewal watchdog, safe release via Lua; used for scheduler leadership, per-member saga serialization, report generation. Document Redlock caveats in an ADR.
- **Clock skew:** server-side time is authoritative; durations measured with monotonic clocks; JWT validation leeway ±30 s; QR pass windows tolerate ±1 step; NTP/chrony noted in deploy docs; tests inject skew with a fake clock.

### 7.4 Data realism (every dashboard number has a source)
| Metric | Source |
|---|---|
| Occupancy, turnstile stream, dwell time | `access-service` from check-in/out events (simulator-generated, same pipeline a real gate would use) |
| Peak-window forecast ("redline in 42 min") | Real model: hour-of-week seasonal average + EWMA of last 30 min, computed from `occupancy_snapshots`; show confidence |
| Sector congestion | per-sector counters from zone-reader events (simulated readers) |
| Air quality ppm | simulated sensor events, labelled "simulated" in dev UI footer |
| MRR, churn, ARPU | billing read-model (events → rollups) |
| Diet distribution, adherence | `diet_assignments`, `meal_logs` |
| InBody scans | manual entry, CSV import, or webhook from a (mock) InBody integration |

### 7.5 REST API (external, `/v1`, OpenAPI 3.1, generated client)
Conventions: JSON; RFC 7807 `application/problem+json` errors with `traceId`; cursor pagination `?limit&cursor`; filtering `?filter[status]=`; `Idempotency-Key` required on all POST that create money/booking/registration effects (24 h dedupe window, same key + different body → 422); `ETag`/`If-Match`; `RateLimit-*` + `Retry-After`; `Sunset`/`Deprecation` headers for deprecated versions; `X-Request-Id` propagated; `Accept-Language`.
Core endpoints (expand as required by the pages above):
`POST /auth/register|login|refresh|logout|mfa/verify|password/forgot|password/reset`, `GET /auth/.well-known/jwks.json`, `GET/DELETE /me/sessions`; `GET/POST /members`, `GET/PATCH /members/{id}`, `POST /members/bulk/assign-trainer`, `POST /members/export`; `GET /schedule?from&to&studio&coach&category`, `POST /sessions`, `PATCH /sessions/{id}` (If-Match), `POST /sessions/{id}/bookings`, `DELETE /bookings/{id}`, `POST /sessions/{id}/checkin`, `POST /sessions/{id}/substitute`; `GET/POST /protocols`, `PUT /protocols/{id}`, `POST /diet/assignments:bulk`, `POST /assessments`; `GET /billing/overview|invoices|subscriptions`, `POST /billing/refunds`, `POST /webhooks/payments/{provider}`; `POST /access/checkin`, `GET /access/stream` (SSE), `GET /access/ws` (WS), `POST /access/lockdown`; `GET /notifications/poll?cursor&timeout=25` (long polling), `GET /notifications/stream` (SSE); `GET /health/live|ready|startup`; `GET /metrics` (internal network only).
**Versioning:** URI major (`/v1`, `/v2`), additive changes are non-breaking; breaking changes require `/v2` side-by-side, deprecation notice, and Kong routing; contract tests (Schemathesis against OpenAPI + Pact for service-to-service); **semantic versioning** for every package/service/image, Conventional Commits, automated changelog + release tags (release-please or Changesets).
**gRPC (internal):** `.proto` in `packages/contracts`, buf lint + breaking-change check in CI; deadlines on every call; client-side load balancing via headless Services; status-code → retry policy mapping.
**Outbound webhooks** (integrations): HMAC-SHA256 signatures with timestamp, exponential-backoff retries with jitter (up to 8 attempts over ~24 h), DLQ, delivery log + replay in UI. **Inbound webhooks** (payments): verify signature + timestamp tolerance, de-dupe by provider event id, persist raw then ACK fast (<200 ms), process asynchronously.

### 7.6 Realtime (use each transport for what it's best at, and document why in `docs/realtime.md`)
- **WebSocket** (bi-directional, low latency): live turnstile stream, floor saturation, roster check-in actions and presence. Redis adapter for multi-replica fan-out, auth on upgrade (short-lived ticket), per-connection rate limit, heartbeat/ping, **backpressure**: bounded per-socket send queue; slow consumers get "latest-wins" coalescing for telemetry (drop intermediate frames) or are disconnected with a resume cursor.
- **SSE** (server→client, auto-reconnect, proxy-friendly): notifications, dashboard KPI ticks, System/queue monitor, with `Last-Event-ID` resume.
- **Long polling** (fallback for restrictive networks, and for the member portal's low-frequency updates): `GET /notifications/poll` holds ≤ 25 s, returns on event or timeout, cursor-based, no lost events.
- Frontend negotiates WS → SSE → long-poll automatically and surfaces connection state in the UI (green/amber/red dot with tooltip).


---

## 8. SECURITY (implement, then attack it with tests)

- **AuthN:** argon2id; short-lived access JWT (10 min, EdDSA/RS256, `kid` header) held **in memory**; **refresh token** in `HttpOnly; Secure; SameSite=Strict` cookie, **rotated on every use with reuse detection** (reuse ⇒ revoke the whole token family and alert). **JWT key rotation:** JWKS endpoint with ≥2 active keys, scheduled rotation job (every 30 days) with overlap window, gateway caches JWKS with TTL and refetch-on-unknown-`kid`. Account lockout/backoff, breached-password check (k-anonymity HIBP optional), email verification, MFA (TOTP + WebAuthn), recovery codes, step-up auth for Tier-1 actions (lockdown, refunds, role changes).
- **OAuth/OIDC:** "Continue with Google" via authorization-code + **PKCE**, `state`/`nonce`, verified-email linking rules, account-linking confirmation to prevent takeover.
- **IAM:** RBAC+ABAC (CASL) with policy tests; per-service **least-privilege DB roles**; Kubernetes ServiceAccounts + RBAC minimal; NetworkPolicies default-deny; separate MinIO/Rabbit users per service; audit every privileged action (who, what, before/after, IP, request-id, hash-chained).
- **Secrets management:** none in git; `gitleaks` in CI + pre-commit; compose uses `.env` + Docker secrets; k8s uses **External Secrets Operator ← Vault (dev mode locally)**; rotation runbook; secrets never logged (pino redaction list).
- **TLS / in-transit:** TLS 1.2+ (prefer 1.3), HSTS preload, modern ciphers, OCSP stapling config; local certs via mkcert; cert-manager in k8s; TLS to Postgres/Redis/Rabbit/MinIO enabled in non-dev overlays; inter-service mTLS documented (+ optional Linkerd manifest).
- **At rest:** encrypted volumes/StorageClass config; **field-level envelope encryption** (AES-256-GCM, per-record DEK wrapped by a KEK from Vault transit) for phone, DOB, health notes, assessments; MinIO SSE; encrypted backups.
- **WAF / DDoS:** ModSecurity + OWASP CRS (paranoia level 1, tuned exclusions documented) at Nginx; request-size, header-size, timeouts (slowloris), per-IP connection and rate limits; k6 attack scripts (SQLi/XSS payloads, flood) prove blocking. Document upstream DDoS protection (CDN/anycast) for production.
- **CORS:** explicit origin allowlist per environment, no wildcard with credentials, preflight caching.
- **CSRF:** SameSite=Strict cookie + double-submit/`Origin` check on cookie-authenticated endpoints (refresh/logout); bearer-only elsewhere.
- **SQL injection:** parameterized queries only (Drizzle), lint ban on string-built SQL, ZAP/sqlmap-style tests in CI.
- **XSS:** React escaping, strict **CSP with nonces** + Trusted Types, DOMPurify for the only rich-text fields (announcements, diet notes), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, safe file upload (type sniffing, size caps, AV hook, served from a separate origin with `Content-Disposition`).
- **SSRF:** all server-side URL fetches (avatar-from-URL import, outbound webhook targets, OAuth discovery) go through one `safeFetch`: scheme allowlist, DNS resolve + block private/loopback/link-local/metadata ranges, pin resolved IP (anti-rebinding), no redirects to blocked ranges, timeouts + size caps; tests for `169.254.169.254`, `localhost`, decimal/IPv6 tricks.
- **Other:** mass-assignment protection (DTO whitelists), IDOR tests for every `/:id`, rate-limited sensitive endpoints, dependency & image scanning (Trivy, `pnpm audit`, license check), SBOM (syft), SAST (CodeQL/Semgrep), OWASP ASVS L2 checklist in `docs/security.md`, privacy features (data export/delete, consent log, retention jobs).

---

## 9. RELIABILITY & RESILIENCE (build `packages/resilience`, use everywhere, test each)

- **Rate limiting:** layered. (1) Nginx `limit_req/limit_conn` coarse per-IP; (2) Kong plugin per consumer/route with Redis; (3) app-level **token bucket / sliding window in Redis (Lua, atomic)** with per-tenant, per-user, per-route policies. Defaults: anonymous 60/min/IP; `/auth/login` 5/min per IP+account with exponential lockout; authenticated 600/min/user; booking 10/min/user; check-in 30/s/hub; webhooks per-provider quota. Always `429` + `Retry-After` + `RateLimit-*`. Frontend handles 429 gracefully (countdown UI).
- **Timeouts:** every outbound call has a timeout (HTTP 3 s default, gRPC deadlines, DB `statement_timeout`, Redis command timeout, MQ publish confirm timeout) and a **deadline budget propagated** via `x-request-deadline`/gRPC deadline so downstream work stops when the caller has given up.
- **Retries + exponential backoff + jitter:** full-jitter backoff (`base 100 ms, factor 2, cap 5 s, max 3`), retry **only** idempotent operations or those carrying an idempotency key and only on retryable errors (timeouts, 502/503/504, `UNAVAILABLE`); **retry budgets** (≤10% extra load) to avoid retry storms.
- **Circuit breakers:** per dependency (payment provider, SMTP, each gRPC peer, Redis cache): closed → open (error-rate or slow-call-rate threshold over a rolling window) → half-open probes; fallbacks (serve stale cache, queue for later, degrade feature) and metrics (`circuit_state`). **Bulkheads**: separate pools/concurrency limits per dependency.
- **Idempotency:** `Idempotency-Key` middleware (store request hash + response, lock in-flight duplicates, return the original response), idempotent consumers via `inbox_dedup`, natural idempotency for PUT/DELETE, unique constraints as the last line of defense.
- **Message queues / Pub-Sub / event-driven:** RabbitMQ topic exchange (pub/sub fan-out) + per-consumer **quorum queues**; publisher confirms; consumer manual ack, `prefetch` tuned; **retry topology** with delayed retry queues (TTL + dead-letter back) at 5 s/30 s/5 min, then a **Dead Letter Queue** per consumer after N failures; poison-message handling; DLQ viewer + **replay/discard** in the System page; alert on DLQ depth > 0 for 10 min. Ordering where required via per-aggregate routing (consistent-hash exchange) and version checks.
- **Outbox/inbox + sagas** (Section 3.2) for **distributed transactions** (no 2PC); timeouts and compensations tested with fault injection at each step.
- **Backpressure & load shedding:** bounded in-memory queues, Rabbit prefetch limits, `p-limit` concurrency on heavy jobs, HTTP `maxConnections`, event-loop-lag monitor (`monitorEventLoopDelay`) that sheds low-priority traffic with `503 + Retry-After` when lag > 200 ms, WS slow-consumer policy, upstream pause when downstream queue depth exceeds high-water mark. Proven by a k6 stress test.
- **Health checks & probes:** `/health/live` (process only, never touches deps), `/health/ready` (DB, Redis, Rabbit with short timeouts + 1 s cache; fails when draining), `/health/startup` (migrations/warm-up done). K8s `livenessProbe`, `readinessProbe`, `startupProbe` configured accordingly. **Graceful shutdown:** SIGTERM → fail readiness → `preStop` sleep → stop accepting → drain HTTP/WS/consumers → close pools; `terminationGracePeriodSeconds` set; PodDisruptionBudgets; topology spread + anti-affinity.
- **Cron jobs** (`apps/scheduler`, **leader-elected** so N replicas run each job once; fencing token; missed-run catch-up; idempotent; overlap protection; per-job metrics + alert on missed/failed): membership expiry/renewal reminders, dunning retries, waitlist cleanup, partition creation/archival, occupancy snapshot + forecast rollups, nightly KPI reconciliation, JWT key rotation, expired idempotency/session cleanup, report emails, backup verification, cert-expiry check.
- **Leader election:** Redis lease with fencing for the scheduler (and Kubernetes `Lease` implementation behind the same interface, selectable by env); chaos test kills the leader and verifies takeover < 15 s with no double execution.
- **Memory leaks / GC / thread safety:** `--max-old-space-size` derived from container limit (~75%); export V8 heap, GC pause, event-loop-lag, handle/active-request metrics; bounded caches (LRU with max size/TTL); WS/SSE listener and interval cleanup tests; frontend `AbortController`/effect cleanup; **30-minute k6 soak** asserting RSS slope ≈ 0; runbook for heap snapshot (`--heapsnapshot-signal`, admin-only endpoint disabled in prod). CPU-heavy work (PDF/CSV export, image resize) in `worker_threads` or `fn-pdf-export`; no mutable module-level request state; shared state only via Redis/DB with atomic ops; per-key async mutex where needed.
- **Tail latency:** histogram buckets tuned for p50/p95/p99/p99.9; avoid head-of-line blocking; hedged requests for idempotent replica reads (cancel the loser); timeouts shorter than client timeouts; k6 **arrival-rate** executors (avoid coordinated omission); budget table in `docs/latency.md`.
- **Network partitions:** Toxiproxy scenarios (latency, bandwidth, reset_peer, partition between service↔Redis, service↔Postgres, service↔Rabbit); document and test each degraded mode (e.g. cache down → DB with circuit breaker; Rabbit down → outbox accumulates; Redis down → rate-limit fails open for reads, closed for auth).

---

## 10. CACHING, EDGE, NETWORK

- **Layers:** browser (ETag, `Cache-Control`), CDN/edge (Nginx cache emulating CDN locally; CloudFront/Cloud CDN in Terraform ref) → gateway micro-cache for public GETs (1–5 s) → Redis cache-aside → DB.
- **Immutable hashed assets** (`max-age=31536000, immutable`); HTML `no-cache`; public plans/schedule `s-maxage` + `stale-while-revalidate`; authenticated responses `private, no-store` unless explicitly safe.
- **Cache invalidation:** event-driven, tag-based (`member:{id}`, `schedule:{hub}:{week}`); write-through for settings; versioned keys for protocols; negative caching with short TTL; **stampede protection** (single-flight lock + TTL jitter + stale-while-revalidate); `CDN purge` hook on publish events; metric `cache_hit_ratio` per namespace with alert on drop. A test proves invalidation after update (no stale reads beyond N ms).
- **Load balancing:** Nginx `upstream` (`least_conn`, passive+active health checks), k8s Service round-robin, **headless Service + client-side LB for gRPC**, WS without sticky sessions (Redis fan-out). Document L4 vs L7 trade-offs.
- **Reverse proxy & gateway roles** documented (`docs/edge.md`): Nginx = TLS/WAF/static/caching/compression/limits; Kong = authN, per-consumer limits, routing/versioning/canary, plugins, observability.
- **HTTP/2 everywhere at the edge**; **HTTP/3 (QUIC over UDP)** enabled in an optional Nginx profile with `Alt-Svc` (tag CONFIGURED); gRPC over HTTP/2 internally.
- **DNS & service discovery:** compose service-name DNS; k8s CoreDNS + Services; `ndots` tuning, client DNS cache with TTL respect + retry; document NodeLocal DNSCache; failure test (DNS flap). **TCP vs UDP** doc + usage: TCP for APIs/DB/MQ; **UDP** for StatsD-style metrics and QUIC; keepalive, `TCP_NODELAY`, connection reuse, pool tuning documented with measurements.

---

## 11. INFRASTRUCTURE, DELIVERY, DEPLOYMENT

- **Docker:** multi-stage, non-root, `distroless`/slim, pinned digests, `.dockerignore`, healthcheck, read-only root FS, dropped capabilities, `tini`/proper signal handling; BuildKit cache mounts; Trivy-clean (no HIGH/CRITICAL without waiver).
- **Compose profiles:** `core` (nginx, kong, 3–7 services, postgres, pgbouncer, redis, rabbit, minio, simulator), `full` (+ prometheus, grafana, loki, tempo, otel, alertmanager, vault, unleash, mailhog), `ha` (+ replica, 2 shards), `chaos` (+ toxiproxy).
- **Kubernetes** (kustomize base + overlays, and a Helm chart): Deployments, Services, Ingress (ingress-nginx + modsecurity), ConfigMaps, ExternalSecrets, HPA (CPU + custom metrics), **KEDA** (worker scale on queue depth, scale-to-zero in non-prod), VPA (recommend mode), PDBs, NetworkPolicies, ResourceQuotas/LimitRanges, topology spread, CloudNativePG cluster (primary + replica + PITR backups), Redis, RabbitMQ cluster operator, cert-manager, Prometheus Operator `ServiceMonitor`/`PrometheusRule`, Argo Rollouts. `make kind-up deploy` must bring a working cluster locally.
- **Autoscaling & scaling:** HPA targets (CPU 65%, p95 latency/RPS via custom metric), KEDA for queues, horizontal-vs-vertical write-up (`docs/scaling.md`) with k6 results showing scale-out under load.
- **Service discovery:** k8s DNS + endpoints; health-gated registration; documented in `docs/service-discovery.md`.
- **Infrastructure as Code / Terraform:** module `kind-local` (kind cluster + Helm releases, actually applyable locally) and module `aws-reference` (VPC, EKS, RDS Postgres with read replica, ElastiCache, S3 + CloudFront, WAF, Secrets Manager, Route53 with failover records, multi-region variant) validated with `terraform fmt/validate/plan` + `tflint` + `checkov`, **never applied automatically**; remote state + locking documented.
- **Helm charts:** values per env, schema validation (`values.schema.json`), `helm lint`/`helm template | kubeconform` in CI.
- **CI/CD (GitHub Actions):** on PR → install with frozen lockfile + cache → lint, typecheck, unit, integration (Testcontainers), contract (buf breaking, OpenAPI diff, Pact), security (gitleaks, CodeQL/Semgrep, Trivy fs+image, audit, license), build images with **Buildx layer caching + Turborepo remote/local cache**, SBOM + provenance (cosign sign), spin up ephemeral `kind` env, **Playwright e2e + visual regression vs Stitch baselines + axe a11y + k6 smoke**; on merge to `main` → push to GHCR, deploy to staging (Argo CD/Helm), run smoke + SLO check, **progressive delivery to prod** (manual approval). Required checks + branch protection documented. Pipeline time budget ≤ 12 min via parallelism and caching.
- **Dependency hell mitigation:** pnpm workspaces + strict peer deps, `pnpm.overrides`, lockfile enforced, Renovate with grouped updates and automerge for patch, `knip`/`depcheck`, duplicate-version report, engine pinning (`.nvmrc`, `packageManager`), reproducible builds.
- **Database migrations & schema versioning:** forward-only, reviewed, tested migrations (drizzle-kit) run as a **pre-deploy Job** (not at app start in prod); **expand → migrate → contract** policy so old and new app versions coexist (required for blue-green/canary/rollback); migration lock to prevent concurrent runs; `schema_migrations` version exposed in `/health/startup`; backfills batched and resumable; down-migration or restore plan documented for each risky change; CI runs migrate-up on a prod-like snapshot and checks lock duration.
- **Feature flags:** Unleash (flags + gradual rollout + kill switches) via OpenFeature SDK in services and web; seed flags: `new_timetable_view`, `ai_meal_suggestions`, `kiosk_mode`, `emergency_lockdown_ui`, `waitlist_auto_promote`, `dashboard_v2_canary`; flags are short-lived with owners and expiry in `docs/flags.md`; admin UI exposes read-only flag state in System.
- **Deployment strategies (each demonstrated with a runnable script + Argo Rollouts manifests):** **Rolling** (default, `maxUnavailable 0`, readiness-gated) · **Blue-green** (`web` and `billing-service`: preview service, smoke tests, manual promote, instant switch back) · **Canary** (`scheduling-service` and Kong header/percentage routing: 5% → 25% → 50% → 100% with **Prometheus-based automated analysis** on error rate & p99; auto-abort/rollback) · **Rollbacks** (`make rollback`, `kubectl rollout undo`, Argo abort, Helm rollback, DB-compat guarantees from expand/contract; rollback drill recorded in a postmortem).
- **Serverless considerations:** `fn-pdf-export` packaged as a function container runnable on Cloud Run/Lambda-style runtimes and in compose; document **cold starts** (measure, then mitigate: slim image, lazy init, min instances, warm pings) and **serverless limits** (timeouts, memory, payload, concurrency, connection explosion → need PgBouncer/RDS Proxy) in `docs/serverless.md`; measure cold-start vs warm latency with k6 and record results. Also measure and optimize **pod cold start** (startup probe, image size, warm caches).

---

## 12. OBSERVABILITY, SRE, OPERATIONS

- **Three pillars + correlation:** OpenTelemetry SDK in every service and the browser (web-vitals + fetch/XHR spans). **Distributed tracing** across HTTP, gRPC, Postgres, Redis, and RabbitMQ (trace context in message headers) with sampling (100% errors/slow, 10% baseline). **Logging:** structured JSON (pino) with `trace_id`, `span_id`, `request_id`, `org_id`, `hub_id`, `user_id` (hashed) and PII redaction; shipped to Loki; log levels via runtime flag; sampling for noisy paths. **Metrics:** RED (rate/errors/duration) per route, USE (utilization/saturation/errors) per resource, queue depth/age, DLQ depth, saga outcomes, cache hit ratio, circuit state, replica lag, event-loop lag, GC pause, business KPIs (check-ins/min, bookings/min, payment success rate).
- **Dashboards as code (Grafana JSON provisioned):** API Golden Signals · Edge/Nginx/Kong · Postgres/PgBouncer · Redis · RabbitMQ & DLQ · Sagas · Realtime connections · Node runtime (heap/GC/loop) · K8s workload · Deployment/Canary analysis · SLO & error budget · Business.
- **SLIs/SLOs/error budgets (`docs/slo.md`, 30-day windows):**
  | Journey | SLI | SLO |
  |---|---|---|
  | API availability | non-5xx / total at gateway | 99.9% (budget ≈ 43 min/month) |
  | Read latency | p99 of GET < 500 ms | 99% of windows |
  | Write latency | p99 of POST/PUT < 800 ms | 99% |
  | Check-in (gate→decision) | p99 < 150 ms | 99.5% |
  | Realtime freshness | event→UI p95 < 1 s | 99% |
  | Booking correctness | oversell count | 0 |
  | Payment webhook processing | processed < 60 s | 99.9% |
  Error-budget policy: burn > 50% in 7 days ⇒ freeze feature deploys, prioritize reliability.
- **Alerts (Alertmanager):** **multi-window multi-burn-rate** SLO alerts (14.4× over 1h/5m page; 6× over 6h/30m page; 1× ticket), saturation (CPU, memory, disk, connections), DLQ depth, replication lag, cert expiry < 14 d, cron missed run, circuit open > 5 min, canary analysis failed, backup older than 26 h, 5xx spike, login-failure spike (security). Each alert links a runbook in `docs/runbooks/<alert>.md` with: impact, dashboards, first 5 checks, mitigations, escalation. Routing to a webhook receiver that simulates Slack/PagerDuty; severity matrix SEV1–4.
- **Synthetic monitoring:** blackbox probes for login, schedule load, check-in path, TLS expiry; also a canary user journey in Playwright run every 5 min in staging.
- **Observability in the product:** the System page surfaces health, queues, DLQ, sagas, flags, build/version, SLO widgets; every error screen shows a `requestId`.
- **On-call & incidents:** `docs/oncall.md` (rotation, escalation, handoff, SEV definitions, comms templates, status page process), `docs/incident-response.md`, `docs/postmortems/TEMPLATE.md` (blameless, timeline, impact, root cause, 5-whys, what went well/poorly, action items with owners), plus **at least three game-day postmortems written from real drills you run** (e.g. DB failover, Redis outage, bad canary rollback), clearly labelled as exercises with real measured numbers.

---

## 13. DISASTER RECOVERY, CHAOS, COST

- **Backups:** CloudNativePG/WAL-G continuous WAL archiving + daily base backups to MinIO/S3, encrypted, retention policy, **PITR**; Redis AOF+RDB; MinIO versioning + replication notes; automated **restore-verification job** (restores into a scratch DB nightly and runs checksum/row-count queries; alert on failure). Targets **RPO ≤ 5 min, RTO ≤ 30 min**; `docs/dr.md` with step-by-step restore + a recorded drill with measured RTO.
- **Failover:** replica promotion drill (compose script + k8s operator failover), app reconnect behavior verified (pool re-resolution, retries, no data loss for acknowledged writes); Rabbit node loss (quorum queues); Redis sentinel/replica notes; **multi-region** reference (active-passive: async replica region, Route53/Cloud DNS failover, data-residency notes, RPO/RTO trade-offs) in Terraform + doc, tagged CONFIGURED/DEMONSTRATED honestly.
- **Chaos engineering:** Toxiproxy + Chaos Mesh/Litmus experiments with hypotheses, steady-state metrics, blast radius, abort conditions: kill pods, kill leader, add latency to DB, partition Redis, fill disk, slow consumer, clock skew injection, DNS failure, dependency 100% errors. Script `make chaos`; results recorded in `docs/chaos/*.md`.
- **Cost optimization (`docs/cost.md`):** right-sized requests/limits from load tests, HPA min/max, KEDA scale-to-zero (non-prod), distroless images, cache hit-rate economics, log/metric/trace sampling and retention tiers, S3 lifecycle (archive partitions), spot/preemptible node pools in Terraform ref, cost-per-1000-check-ins estimate table, environment shutdown schedules.

---

## 14. TESTING & QUALITY GATES

- **Unit** (Vitest/Jest) ≥ 80% on domain logic and `packages/resilience`; **integration** with Testcontainers (real Postgres/Redis/Rabbit); **contract** (OpenAPI/Schemathesis, Pact, buf breaking); **concurrency/race** tests (booking oversell, double-submit idempotency, waitlist promotion, deadlock recovery, saga compensation at every step); **security** tests (IDOR, JWT tamper/alg-none/expired/reuse, CSRF, XSS/SQLi payloads, SSRF matrix, rate-limit enforcement); **e2e** (Playwright, all key flows per role); **visual regression** against Stitch `screen.png` baselines (threshold documented); **a11y** (axe, keyboard-only flows); **performance** (k6: smoke, load, stress, spike, soak, breakpoint) with thresholds failing CI; **resilience** (chaos suite); **migration** tests; **frontend** (Storybook interaction tests).
- **Definition of done for any feature:** typed, validated, authorized, audited, observable (trace + metric + log), tested, documented, flag-guarded if risky, responsive, accessible, animated per motion language, with loading/empty/error states.

---

## 15. SEED DATA (deterministic, scalable, consistent with the designs)

`make seed` loads (seeded RNG): 1 org, hubs (Downtown Flagship cap 300 + 1–2 more), 1,842 members distributed per design (1,680 active, 84 expiring, 78 frozen), tiers 129/199/289, 8+ staff (**Elena Rostova** strength master coach, **David Kim**, **Liam Brooks**, **Maya Lin**, **Jaxson Hayes** lead strength, **Dr. Aris Thorne** sports dietitian, **Soren Lindqvist** recovery, **Marcus Vance** ops director), studios (Studio 1 MetCon, 2 Yoga, 3 Cycle, 4 Oly Lifting, Recovery Zone), 4 weeks of recurring classes incl. those in the design (Morning Ignite HIIT, Power Vinyasa Flow, Rhythm Spin 45, Express Kettlebell & Core, Olympic Weightlifting Clinic, MetCon Savage Circuit, Contrast Hydro & Recovery), ≥14 diet protocols in 4 categories (Hypertrophy & Mass Gain 3,000–3,500 kcal; Fat Loss & Metabolic Cut 1,800–2,100; Keto & Metabolic Flexibility 2,200; Endurance & Stamina Engine 2,800) with full meal timelines, 90 days of check-ins/occupancy history (peak ~18:00–19:00), invoices/payments including past-due cases, InBody scans, notes. Demo logins in README: `director@kineticfit.dev`, `trainer@…`, `dietitian@…`, `frontdesk@…`, `finance@…`, `member@…` (dev only, documented as such). `make seed -- --scale=10` for performance tests.


---

## 16. TRACEABILITY MATRIX (all 111 required concepts; copy into `docs/TRACEABILITY.md`, fill the **Evidence** column with real file paths/test names as you build, and keep Level honest)

Level: **I** = IMPLEMENTED (code + passing test) · **C** = CONFIGURED (real manifest/config, validated by lint/dry-run) · **D** = DEMONSTRATED (script/experiment + written result).
(Numbering follows my request list; #59 contained Logging + WAF, and WAF appeared again as #74; Cache "Irvalidation" = Invalidation; "N+l" = N+1; "SLOS" = SLOs.)

| # | Concept | Where / how | Lvl |
|---|---|---|---|
| 1 | Rate limiting | Nginx + Kong + Redis token bucket (§9); 429 UX | I |
| 2 | Caching | Browser/CDN/gateway/Redis cache-aside (§10) | I |
| 3 | Load balancing | Nginx upstream `least_conn`, k8s Services, gRPC client-side LB | I/C |
| 4 | Reverse proxies | Nginx edge (TLS, WAF, cache, limits) `docs/edge.md` | I |
| 5 | API gateways | Kong declarative config: JWT, limits, routing, canary | I |
| 6 | CI/CD | GitHub Actions pipeline + progressive delivery (§11) | C/I |
| 7 | Docker | Hardened multi-stage images, compose profiles | I |
| 8 | Kubernetes | kustomize + Helm on kind, probes, HPA, PDB, NetPol | I/C |
| 9 | Service discovery | Compose DNS, k8s DNS/headless Services, `docs/service-discovery.md` | I |
| 10 | Circuit breakers | `packages/resilience` per dependency, fallbacks, tests | I |
| 11 | Timeouts | Every outbound call + deadline propagation | I |
| 12 | Retries | Retry policy + budgets, idempotent-only | I |
| 13 | Exponential backoff | Full-jitter backoff in HTTP, gRPC, MQ retry queues, webhooks, frontend | I |
| 14 | Idempotency | `Idempotency-Key` middleware, inbox dedup, unique constraints | I |
| 15 | Message queues | RabbitMQ quorum queues, confirms, manual acks | I |
| 16 | Pub/Sub | Topic exchange `kf.events`, multi-consumer fan-out | I |
| 17 | Event-driven architecture | Event catalog + outbox + read models (§3.1) | I |
| 18 | Distributed transactions | Sagas + outbox, no 2PC (§3.2) | I |
| 19 | Saga pattern | Registration, Booking, Renewal sagas + viewer | I |
| 20 | Dead letter queues | Per-consumer DLQ, viewer, replay/discard, alert | I |
| 21 | Cron jobs | `apps/scheduler` (leader-elected, idempotent) | I |
| 22 | WebSockets | Turnstile stream, roster, presence + backpressure | I |
| 23 | Long polling | `/notifications/poll` + client fallback | I |
| 24 | Server-Sent Events | Notifications, KPI ticks, System monitor | I |
| 25 | Database indexing | Index design + `EXPLAIN` evidence in `docs/perf/` | I |
| 26 | Query optimization | Before/after plans, keyset pagination, `pg_stat_statements` | I |
| 27 | N+1 queries | Query-budget tests, batching | I |
| 28 | Connection pooling | PgBouncer + app pool sizing doc | I |
| 29 | Read replicas | Replica + read/write split + lag fallback | I/C |
| 30 | Sharding | Shard router, 2-shard demo (`ha` profile) | D |
| 31 | Partitioning | Monthly partitions + cron maintenance + archival | I |
| 32 | Replication | Streaming replication (CNPG / compose `ha`), WAL archive | C/D |
| 33 | Leader election | Redis lease + fencing / k8s Lease; kill-leader chaos test | I |
| 34 | CAP theorem | `docs/consistency.md` CP vs AP decisions per domain + ADR | I(doc)+tests |
| 35 | Eventual consistency | Read models, "as of" UI stamps, reconciliation job | I |
| 36 | Optimistic locking | `version` + ETag/If-Match + 409 UX | I |
| 37 | Pessimistic locking | `FOR UPDATE SKIP LOCKED` waitlist/outbox | I |
| 38 | Distributed locks | Redis fenced locks (+ Redlock caveats ADR) | I |
| 39 | Race conditions | 200-way booking test, double-submit tests | I |
| 40 | Deadlocks | Lock ordering + `40P01` retry + deliberate-deadlock test | I |
| 41 | Memory leaks | Soak test + heap tooling + cleanup tests | I/D |
| 42 | Garbage collection | GC metrics, heap sizing, runbook | I/C |
| 43 | Thread safety | worker_threads, no shared mutable state, atomic ops, tests | I |
| 44 | Backpressure | Bounded queues, prefetch, WS coalescing, load shedding | I |
| 45 | Autoscaling | HPA + KEDA + VPA(reco) + load-test proof | C/D |
| 46 | Horizontal scaling | Stateless services, Redis WS adapter, scale-out test | I/D |
| 47 | Vertical scaling | Right-sizing study `docs/scaling.md` | D |
| 48 | CDN | Local edge-cache emulation + CloudFront/Cloud CDN in Terraform | C |
| 49 | Edge caching | `s-maxage`/SWR on public endpoints, purge hook | I/C |
| 50 | Cache invalidation | Tag/event-driven + test for staleness bound | I |
| 51 | Feature flags | Unleash + OpenFeature, canary + kill switches | I |
| 52 | Blue-green deployment | Argo Rollouts (`web`, `billing`) + script | C/D |
| 53 | Canary releases | Argo Rollouts + Prometheus analysis + Kong routing | C/D |
| 54 | Rolling deployments | Default strategy, `maxUnavailable 0`, readiness gates | I/C |
| 55 | Rollbacks | `make rollback`, Argo abort, Helm rollback, drill | D |
| 56 | Health checks | `/health/*` on every service | I |
| 57 | Liveness & readiness probes | k8s probes + startup probe + graceful drain | C/I |
| 58 | Monitoring | Prometheus + Grafana dashboards-as-code | I |
| 59a | Logging | pino JSON + trace ids + Loki + redaction | I |
| 59b / 74 | WAF | ModSecurity + OWASP CRS at Nginx + attack tests | I/C |
| 60 | Distributed tracing | OTel across HTTP/gRPC/DB/Redis/AMQP + browser | I |
| 61 | Metrics | RED/USE/business metrics | I |
| 62 | Alerts | Burn-rate + saturation alerts with runbooks | C |
| 63 | SLOs | `docs/slo.md` + dashboards | I |
| 64 | SLIs | Recording rules | I |
| 65 | Error budgets | Budget dashboard + policy | I(doc)/C |
| 66 | Observability | Correlated logs/metrics/traces + in-app System page | I |
| 67 | Secrets management | Vault + External Secrets, gitleaks, redaction | C/I |
| 68 | IAM | RBAC+ABAC, DB roles, k8s RBAC, NetPol | I/C |
| 69 | OAuth | Google OIDC + PKCE | I |
| 70 | JWT rotation | JWKS multi-key rotation + refresh token reuse detection | I |
| 71 | TLS | mkcert/cert-manager, TLS1.3, HSTS | C |
| 72 | Encryption at rest | Field-level envelope encryption + volume/SSE config | I/C |
| 73 | Encryption in transit | TLS edge, TLS to data stores in non-dev, mTLS doc | C |
| 75 | DDoS protection | Limits, slowloris timeouts, CDN/edge doc + k6 flood proof | C/D |
| 76 | CORS | Strict allowlist + tests | I |
| 77 | CSRF | SameSite + Origin/double-submit + tests | I |
| 78 | SQL injection | Parameterization, lint ban, payload tests | I |
| 79 | XSS | CSP nonce, Trusted Types, DOMPurify, tests | I |
| 80 | SSRF | `safeFetch` + test matrix | I |
| 81 | Database migrations | drizzle-kit, pre-deploy Job, expand/contract | I |
| 82 | Schema versioning | `schema_migrations`, event `schemaVersion`, proto/OpenAPI versions | I |
| 83 | Disaster recovery | `docs/dr.md` + recorded drill | D |
| 84 | Backups | WAL-G/CNPG + restore-verification job | C/I |
| 85 | Failover | Replica promotion drill, Rabbit quorum, reconnect tests | D |
| 86 | Multi-region deployment | Terraform reference + doc (no real cloud spend) | C/D |
| 87 | Chaos engineering | Toxiproxy + Chaos Mesh, game days | D |
| 88 | Cost optimization | `docs/cost.md` + right-sizing numbers | D |
| 89 | Cold starts | `fn-pdf-export` + pod cold-start measurement | D |
| 90 | Serverless limits | `docs/serverless.md` + connection-pool mitigation | D |
| 91 | Latency | Budgets + histograms (`docs/latency.md`) | I |
| 92 | Throughput | k6 load + capacity report | D |
| 93 | P99 latency | p99 SLOs + dashboards + CI thresholds | I |
| 94 | Tail latency | Hedged reads, deadline budgets, analysis | I/D |
| 95 | Network partitions | Toxiproxy partition scenarios + degraded modes | D |
| 96 | Clock skew | Fake-clock tests, JWT leeway, skew injection | I/D |
| 97 | DNS | CoreDNS/ndots/TTL/flap test + doc | C/D |
| 98 | TCP vs UDP | StatsD-UDP metrics + QUIC + keepalive doc | C/D |
| 99 | HTTP/2 & HTTP/3 | Nginx h2 + optional h3, gRPC h2 | C |
| 100 | gRPC | Internal service calls + buf + deadlines | I |
| 101 | Webhooks | Inbound payments + outbound signed w/ retries & DLQ | I |
| 102 | API versioning | `/v1` URI + Sunset headers + Kong routing | I |
| 103 | Semantic versioning | release-please/Changesets, image tags | C |
| 104 | Infrastructure as Code | Terraform + Helm + kustomize + Argo | C |
| 105 | Terraform | `kind-local` (applyable) + `aws-reference` (validated) | C |
| 106 | Helm charts | `deploy/helm/kineticfit` + lint/kubeconform | C |
| 107 | Build caching | Buildx layer cache, Turborepo cache, pnpm store cache | C |
| 108 | Dependency hell | pnpm strictness, overrides, Renovate, dupes report | C |
| 109 | Production incidents | `docs/incident-response.md`, SEV matrix, drills | D |
| 110 | On-call | `docs/oncall.md` | I(doc) |
| 111 | Postmortems | Template + ≥3 drill postmortems | D |

**Extras the list doesn't name but this product needs (also implement):** transactional outbox/inbox, audit hash-chain, webhook signature verification, RRULE recurrence, async export jobs, i18n scaffolding, PWA/offline, data privacy (export/delete), accessibility (WCAG 2.2 AA), performance budgets, API pagination/filter standards.

---

## 17. PHASED EXECUTION PLAN (with gates)

| Phase | Deliver | Gate (must pass before continuing) |
|---|---|---|
| **0 Foundations** | Repo, tooling, CI skeleton, design tokens, `packages/ui` with Storybook (all primitives + states), app shell, auth layouts, ADR 0001–0005, `docs/ASSUMPTIONS.md`, Makefile | `pnpm lint typecheck test build` green; Storybook builds; shell matches Stitch at 1440 px |
| **1 Platform core** | Compose `core`, Nginx, Kong, Postgres+PgBouncer, Redis, Rabbit, MinIO, observability skeleton, `packages/resilience`, `packages/observability`, health endpoints | `make up` healthy; traces/logs/metrics visible; resilience unit tests pass |
| **2 Auth & members** | auth-service (login/register/MFA/OAuth/JWKS/rotation/sessions), member-service, Registration Saga, pages: `/auth*`, `/members`, `/members/:id`, `/settings` | Auth security tests green; Registration Saga compensation tests green; screens match Stitch |
| **3 Scheduling & access** | scheduling-service, access-service, simulator, realtime (WS/SSE/long-poll), pages: `/dashboard`, `/schedule`, `/access`, `/kiosk` | 200-way booking race test = exactly capacity; realtime e2e; dashboard numbers all sourced from API; Stitch visual diff ok |
| **4 Nutrition & billing** | nutrition-service, billing-service, payment adapters, webhooks, dunning, pages: `/nutrition*`, `/billing`, staff pages | Webhook idempotency/replay tests; invoice/refund idempotency; PDF export via function container |
| **5 Portals & polish** | Member portal + PWA, trainer workspace, reports, announcements, facilities, System page (DLQ/sagas/flags), landing, full motion pass, responsive/a11y pass | Playwright e2e for all roles; axe clean; Lighthouse ≥ 90; perf budgets met |
| **6 Reliability & security hardening** | Rate limits, WAF, circuit breakers, backpressure, caching/invalidation, replicas, partitioning, shard demo, locks, leader election, cron | k6 smoke/load/stress/spike/soak pass thresholds; chaos suite green; security suite green |
| **7 Kubernetes & delivery** | Dockerfiles hardened, kustomize/Helm, kind deploy, HPA/KEDA, Argo Rollouts (blue-green, canary, rollback), Unleash, Vault/ESO, Terraform, full CI/CD | `make kind-up deploy` works; canary auto-abort demo; rollback drill; `terraform validate` + `helm lint` + `kubeconform` + `checkov` clean |
| **8 SRE & DR** | Dashboards, SLO/burn-rate alerts, runbooks, backups + PITR + restore verification, failover and chaos game days, postmortems, cost doc, on-call docs | Restore drill measured vs RTO/RPO; every alert has a runbook; traceability matrix 111/111 filled with evidence and honest levels |

At the end of each phase: update `docs/TRACEABILITY.md`, regenerate API clients, run the full test suite, and publish a Walkthrough artifact (screenshots/recordings of the new screens beside the Stitch originals).

---

## 18. FINAL DELIVERABLES (acceptance)

1. Running app via `make up` (+ `make seed`) with every route in Section 5 reachable by the right roles, all data live from the backend, responsive, animated, accessible.
2. `README.md` with 10-minute quickstart, architecture diagram, demo logins, profile guide, troubleshooting.
3. All docs listed in Section 4 present and non-placeholder; `docs/TRACEABILITY.md` covers 111/111 concepts with evidence and honest I/C/D levels.
4. Green CI on a clean clone; reproducible builds; SBOM + signed images.
5. Dashboards, alerts, runbooks, SLOs, load-test reports, chaos reports, DR drill report, ≥3 postmortems.
6. A final **Gap Report**: anything not fully done, why, and the exact next steps, so I can see the truth rather than a polished claim.

Begin now with the Implementation Plan artifact, then Phase 0.
