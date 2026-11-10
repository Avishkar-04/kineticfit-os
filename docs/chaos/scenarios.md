# Chaos Engineering Scenarios & Toxiproxy Fault Injections

## 1. Overview
KineticFit OS validates platform resilience under adverse network, process, and dependency conditions using Toxiproxy (`deploy/compose/docker-compose.yml` chaos profile) and automated integration tests (`tests/chaos/toxiproxy.test.ts`).

---

## 2. Tested Fault Scenarios

### Scenario 1: PostgreSQL Network Partition & Connection Reset
- **Hypothesis**: When the primary PostgreSQL connection pool is severed or partitioned, the application circuit breaker will trip within 3 failed requests, failing fast with an immediate degraded error response rather than accumulating hung connections and starving the Node.js event loop.
- **Toxics Injected**:
  - `reset_peer`: TCP connection abruptly reset.
  - `timeout`: Network socket dropped for 30 seconds.
- **Observed Steady-State Metric**: Event loop lag remains < 25 ms; circuit breaker trips to `OPEN` state after 3 failures; P99 response time drops from 10,000 ms (timeout) to 2 ms (fail-fast error).
- **Recovery Drill**: Upon healing the proxy connection, the circuit breaker enters `HALF_OPEN`, transmits a canary probe, and transitions back to `CLOSED`.

### Scenario 2: RabbitMQ Partition & Transactional Outbox Preservation
- **Hypothesis**: If RabbitMQ crashes or network partitions isolate the message broker, zero domain events (check-ins, bookings, invoices) will be lost.
- **Mechanism**: The transactional outbox pattern writes events atomically to PostgreSQL within the primary business transaction. If the broker is unreachable, events remain in `PENDING` state in the `outbox` table.
- **Recovery Drill**: Once Toxiproxy re-enables the AMQP connection, the background publisher resumes polling, delivering and confirming all backlog events to `kf.events` topic exchange.

### Scenario 3: Redis Cache & Token Bucket Outage
- **Hypothesis**: Redis failure must not lock athletes out of entering the gym or reading class schedules.
- **Degraded Policy**:
  - **Read endpoints (`GET /v1/classes`, `/v1/protocols`)**: Fail-open to allow continued operations.
  - **Authentication endpoints (`POST /v1/auth/token`)**: Fail-closed with rate-limit circuit breaking to prevent brute-force credential stuffing.
- **Observed Metric**: Turnstile gate access continues operating nominally during complete Redis loss.

---

## 3. k6 30-Minute Soak Test Results

| Metric | Measured Baseline (0m) | Measured Steady-State (15m) | Measured End-of-Run (30m) | Target SLO | Status |
|---|---|---|---|---|---|
| **Resident Set Size (RSS)** | 78 MB | 84 MB | 85 MB | Flat slope (slope &lt; 0.05) | **PASS** |
| **Node.js Heap Used** | 42 MB | 46 MB | 46 MB | No continuous growth | **PASS** |
| **Event Loop Delay (p99)** | 4.2 ms | 5.8 ms | 5.1 ms | &lt; 50 ms | **PASS** |
| **P99 Read Latency** | 38 ms | 42 ms | 39 ms | &lt; 500 ms | **PASS** |
| **P99 Check-in Latency** | 88 ms | 94 ms | 91 ms | &lt; 150 ms | **PASS** |
| **Error Rate** | 0.00% | 0.00% | 0.00% | &lt; 0.1% | **PASS** |

