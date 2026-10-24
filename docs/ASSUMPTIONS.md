# KineticFit OS — Operational Assumptions & Defaults Log

This document records sensible operational defaults and architectural decisions made autonomously per Section 0, Rule 2 of the KineticFit Master Specification.

| ID | Domain | Decision / Assumption | Rationale |
|---|---|---|---|
| ASM-001 | Tenancy | Organization UUID default `01931668-8000-7000-8000-000000000001`, Downtown Flagship Hub UUID `01931668-8000-7000-8000-000000000002`. | UUIDv7 standard guarantees time-ordered locality across indexes. |
| ASM-002 | Currency & Timezone | Configured per-hub via DB rather than hardcoded PST/$ in UI. Downtown Flagship defaults to `America/Los_Angeles` and `USD`. | Multi-hub international expansion requirement (Section 1). |
| ASM-003 | Colors & Styling | Front-matter design tokens in `kinetic_grid/DESIGN.md` (`#111319`, `#c3f400`, `#00eefc`, `#262f3e`, `#ffb4ab`) take precedence over differing prose values. | Section 2.2 #11 mandates front-matter as single source of truth. |
| ASM-004 | Icons | Use `lucide-react` self-hosted icon set across all UI packages. | Avoids Google Fonts CDN runtime dependency and resolves broken icon name defects. |
| ASM-005 | Logos & Assets | SVG inline mark (Bolt + KINETIC FIT wordmark) used across shell and auth screens. Member avatars seed into MinIO with initial-avatar fallbacks. | Solves broken Stitch image references and ensures offline resilience. |
| ASM-006 | Compliance Claims | Removed unverified claims ("SOC2 Type II", "ISO 27001", "HIPAA"). Replaced with live telemetry: verified TLS 1.3 and measured gateway latency. | Adheres to honesty-over-theatre rule (Section 2.2 #7). |
| ASM-007 | Database Access | All backend database communication routes through PgBouncer (transaction pooling) on port 6432. Direct port 5432 is reserved for migrations. | Prevents Postgres connection exhaustion under high concurrency. |
| ASM-008 | Realtime Transports | Client attempts WebSocket first, falling back to SSE, then Long Polling (`/notifications/poll`). | Maximum firewall/proxy tolerance across gym kiosks and mobile networks. |
| ASM-009 | Authentication | EdDSA / RS256 JWT tokens kept strictly in memory (10-minute lifetime). Refresh tokens stored in `HttpOnly; Secure; SameSite=Strict` cookies with family reuse revocation. | Standard OWASP ASVS compliance mitigating XSS token exfiltration. |
| ASM-010 | Seat Reservation Race Conditions | Atomic database row update `booked_count = booked_count + 1 WHERE id = $1 AND booked_count < capacity` coupled with unique index `(session_id, member_id)`. | Prevents class oversell without heavyweight table locks. |
| ASM-011 | Naming Normalization | Membership tier names: `Standard Gym`, `Pro Performance`, `Elite Black VIP`. Master coach: `Elena Rostova`. | Unifies inconsistent Stitch terminology. |
