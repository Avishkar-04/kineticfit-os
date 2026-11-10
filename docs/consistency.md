# KineticFit OS - Consistency Models & CAP Theorem Trade-Offs

Distributed systems cannot simultaneously guarantee Consistency, Availability, and Partition tolerance under network failure (Brewer's CAP Theorem). KineticFit OS intentionally applies different consistency models tailored to the operational invariants of each domain.

---

## 1. Domain Consistency Matrix

| Domain & Service | CAP Choice | Consistency Model | Invariant / Trade-Off Justification |
|---|---|---|---|
| **Class Booking** (`scheduling-service`) | **CP** (Consistency + Partition Tolerance) | **Strong Consistency** (Serial row locks) | Strict capacity limit (e.g. 12 bikes in Cycle Studio). Under partition, bookings reject with 503 rather than oversell. |
| **Payment & Invoicing** (`billing-service`) | **CP** | **Strong Consistency** (Transactional Outbox + Deduplication) | Double-billing is unacceptable. Duplicate webhooks rejected via HMAC + 300s window idempotency key. |
| **Turnstile Check-In** (`access-service`) | **AP** (Availability + Partition Tolerance) | **Eventual Consistency** (Offline JWT validation) | Members must not be physically locked out during AWS/Internet outage. Gate verifies signed local Ed25519 pass and reconciles check-ins later. |
| **Gym Occupancy & Presence** (`access-service`) | **AP** | **Eventual Consistency** (CRDT / Tick counters) | Real-time saturation indicator on landing page can tolerate +/- 2 people discrepancy during network split. |
| **Nutrition Protocols** (`nutrition-service`) | **CP** (Immutable Versioning) | **Immutable Read Consistency** | Protocols are immutable once published (`v1`, `v2`). Athlete always sees exact coach-prescribed macros. |

---

## 2. Eventual Consistency Reconciliation Job

To reconcile AP domains and ensure eventual consistency:
- **Nightly Reconciliation Job**: Runs at 03:00 UTC via leader-elected `apps/scheduler`.
- **Reconciliation Algorithm**:
  1. Compares turnstile offline check-in logs against PostgreSQL `check_ins` table.
  2. Resolves duplicate scans within 60 seconds (debounces accidental double-taps).
  3. Reconciles athlete monthly check-in credits.
  4. Generates an integrity checksum report exposed in the System page.

