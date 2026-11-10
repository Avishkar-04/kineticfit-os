# KineticFit OS - Production Gym Management & Telemetry Operating System

[![CI/CD Pipeline](https://github.com/kineticfit/kineticfit-os/actions/workflows/ci.yml/badge.svg)](https://github.com/kineticfit/kineticfit-os/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: 22](https://img.shields.io/badge/node-22.x-green.svg)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/monorepo-turborepo-blue.svg)](https://turbo.build/)

KineticFit OS is a standalone, production-grade multi-branch gym management and telemetry operating system. It features sub-150ms turnstile access decisions, high-concurrency class booking with 0 oversells, chrono-nutrition planning, automated billing with HMAC webhook security, and full observability.

---

## 1. Quickstart (10 Minutes to Running Platform)

### Prerequisites
- **Node.js**: v22.x
- **pnpm**: v9.12.x (`corepack enable && corepack prepare pnpm@9.12.3 --activate`)
- **Docker & Docker Compose**: v2.20+

### Step 1: Install Dependencies
```bash
git clone https://github.com/kineticfit/kineticfit-os.git
cd "KINETICFIT OS"
pnpm install --frozen-lockfile
```

### Step 2: Build Workspace Packages
```bash
pnpm run build
```

### Step 3: Start Infrastructure via Docker Compose
```bash
# Core Profile: Postgres, PgBouncer, Redis, RabbitMQ, MinIO, Nginx & Kong
docker compose -f deploy/compose/docker-compose.yml --profile core up -d
```

### Step 4: Seed Database
```bash
pnpm run db:seed
```

### Step 5: Start Microservices & Web Frontend
```bash
pnpm run dev
```

The application is now live at:
- **Web App / Admin Portal**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:80` through Nginx)
- **API Gateway (Kong)**: `http://localhost:8000`
- **Auth Service**: `http://localhost:3001`
- **Member Service**: `http://localhost:3002`
- **Scheduling Service**: `http://localhost:3003`
- **Access Service**: `http://localhost:3004`
- **Nutrition Service**: `http://localhost:3005`
- **Billing Service**: `http://localhost:3006`

---

## 2. Demo User Logins

All demo accounts share the password: `KineticFit2026!`

| Role | Email Address | Access & Capabilities |
|---|---|---|
| **Director / Admin** | `director@kineticfit.dev` | Full system access, DLQ manager, Sagas, Financial reports |
| **Master Coach** | `elena.rostova@kineticfit.dev` | Coach Workspace, Athlete rosters, InBody logging |
| **Lead Trainer** | `david.kim@kineticfit.dev` | Athlete training logs, class rosters, shift cover |
| **Sports Dietitian** | `dietitian@kineticfit.dev` | Nutrition meal timelines, TDEE calculator, PDF export |
| **Front Desk** | `frontdesk@kineticfit.dev` | Member check-in, Turnstile override, Kiosk terminal |
| **Active Athlete** | `member@kineticfit.dev` | Member Portal PWA, TOTP QR Pass, Meal Logger, Classes |

---

## 3. Docker Compose Profiles

| Profile | Command | Services Included |
|---|---|---|
| `core` | `docker compose --profile core up -d` | Postgres, PgBouncer, Redis, RabbitMQ, MinIO, Nginx, Kong |
| `full` | `docker compose --profile full up -d` | `core` + Prometheus, Grafana, Loki, Tempo, OpenTelemetry |
| `ha` | `docker compose --profile ha up -d` | `core` + PostgreSQL streaming read replica & 2-shard demo |
| `chaos`| `docker compose --profile chaos up -d`| `core` + Toxiproxy network fault injection container |

---

## 4. Architecture & Stitch Design Tokens

The UI strictly adheres to the Stitch Design System tokens:
- **Surface Dark**: `#111319`
- **Electric Lime (Accent)**: `#c3f400`
- **Cyan Pulse (Accent)**: `#00eefc`
- **Slate Container**: `#262f3e`
- **Safety Coral / Danger**: `#ffb4ab`

For detailed C4 container blueprints, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Testing & Verification

Run the comprehensive test suite across the monorepo:

```bash
# Run all unit, chaos, security, and delivery tests
pnpm exec vitest run

# Run axe-core WCAG 2.2 AA accessibility audit
pnpm --filter @kineticfit/web test

# Run resilience suite (circuit breaker, leader election, sharding)
pnpm --filter @kineticfit/resilience test
```

---

## 6. Documentation Index

- [Architecture Blueprint](docs/ARCHITECTURE.md)
- [Traceability Matrix (111 Concepts)](docs/TRACEABILITY.md)
- [Service Level Objectives (SLOs)](docs/SLO.md)
- [Disaster Recovery Runbook](docs/dr.md)
- [Cost Optimization & Unit Economics](docs/cost.md)
- [Progressive Delivery & Deployment](docs/deployment-strategies.md)
- [Incident Response Protocol](docs/incident-response.md)
- [On-Call Handbook](docs/oncall.md)
