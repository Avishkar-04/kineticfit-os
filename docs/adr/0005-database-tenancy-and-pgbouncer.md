# ADR 0005: Multi-Tenancy Isolation, Drizzle ORM, and Connection Pooling

## Status
Accepted

## Context
KineticFit OS operates as a multi-tenant platform supporting multiple organizations, each containing multiple gym hubs. Concurrency surges during peak workout hours (07:00 and 18:00) risk exhausting Postgres server connections.

## Decision
1. **Tenancy Model**: Row-level tenancy partitioning where all domain entity tables enforce mandatory `org_id` and `hub_id` UUIDv7 columns, supported by composite indexes `(hub_id, ...)`.
2. **Database Access & ORM**: **Drizzle ORM** with `drizzle-kit` migrations for strict TypeScript type inference, zero runtime query generation overhead, and explicit SQL query inspection.
3. **Connection Pooling**: **PgBouncer** operates in transaction pooling mode on port 6432 in front of PostgreSQL 16. App services connect exclusively via PgBouncer. Schema migrations connect directly to Postgres on port 5432 to support DDL operations.

## Consequences
- Guaranteed data isolation between gym hubs and organizations.
- Sustainable resource utilization under concurrent load spikes with bounded backend connection pools.
