# ADR 0004: Multi-Transport Realtime Hub Architecture

## Status
Accepted

## Context
Floor turnstiles, live gym occupancy, class rosters, and notifications require instant push updates. However, client environments range from full-screen gym kiosks to corporate networks with strict firewall rules blocking persistent WebSockets.

## Decision
We implement a three-tier transport negotiation strategy managed by a unified frontend realtime client (`@kineticfit/realtime`):
1. **Tier 1 (WebSocket)**: Primary transport for sub-100ms bi-directional events (turnstile streams, live saturation, instant manual bypass). Backed by Redis Pub/Sub adapter for multi-instance gateway scaling.
2. **Tier 2 (Server-Sent Events / SSE)**: Fallback transport for unidirectional notifications, queue monitoring, and KPI ticks if WebSockets fail or are blocked. Supports `Last-Event-ID` resumption.
3. **Tier 3 (Long Polling)**: Fallback transport (`GET /notifications/poll?timeout=25`) for highly restricted networks and low-frequency mobile updates.

## Consequences
- 100% telemetry delivery resilience regardless of client firewall policies.
- Clear transport health indicator displayed in the application top bar (green/amber/red).
