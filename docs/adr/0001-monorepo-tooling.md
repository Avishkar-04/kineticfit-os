# ADR 0001: Monorepo Architecture with pnpm and Turborepo

## Status
Accepted

## Context
KineticFit OS requires multiple frontend portals (admin, kiosk, member PWA, coach workspace), 7 domain backend microservices, a background worker, a leader-elected scheduler, a telemetry simulator, and shared packages (`ui`, `contracts`, `observability`, `resilience`, `config`). We require fast, reproducible builds, shared dependency caching, and clear contract boundaries.

## Decision
We adopt a monorepo managed with **pnpm workspaces** and **Turborepo**:
1. All services and apps reside in `apps/`.
2. Reusable primitives, contracts, resilience algorithms, and configurations reside in `packages/`.
3. Turborepo pipeline enforces dependency ordering (`build`, `lint`, `typecheck`, `test`).
4. Strict package exports prevent unintended cross-package coupling.

## Consequences
- Fast incremental builds and test runs with remote/local cache.
- Unified TypeScript standards across frontend and backend.
- High developer ergonomics with zero publish step for internal libraries.
