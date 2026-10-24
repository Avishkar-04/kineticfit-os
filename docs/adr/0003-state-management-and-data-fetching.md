# ADR 0003: Client-side State Management and Data Fetching Strategy

## Status
Accepted

## Context
KineticFit OS features rapid live telemetry, multi-step registration sagas, dynamic filter drawers, and heavy data tables. State needs to be partitioned efficiently between server cache, transient UI state, and persistent client settings.

## Decision
1. **Server State**: Managed strictly through **TanStack Query (React Query)** with `stale-while-revalidate`, automatic request deduplication, optimistic updates with rollback, and exponential backoff retry for idempotent requests.
2. **Client State**:
   - URL State: React Router search params for table filters, pagination, active tab, and modal deep-linking.
   - Global Transient State: **Zustand** for auth user session context, active hub context, command palette visibility, audio alert toggles, and realtime transport status.
   - Form State: **react-hook-form** validated with **zod** schemas matching server contracts.

## Consequences
- Zero race conditions in server state hydration.
- Fully shareable URLs with deep-linked views.
- Predictable and testable client state updates.
