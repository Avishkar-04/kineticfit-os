# KineticFit OS - Networking: TCP vs. UDP, Multiplexing & Connection Pools

This document outlines the networking protocol selection criteria, HTTP/2 multiplexing, StatsD UDP metric telemetry, and socket keepalive tuning.

---

## 1. Protocol Selection: TCP vs. UDP

| Protocol | Used By | Justification |
|---|---|---|
| **TCP** | REST APIs, PostgreSQL, Redis, RabbitMQ | Reliable, ordered, guaranteed delivery required for financial transactions, member records, and turnstile locks. |
| **UDP** | StatsD-style high-frequency metrics, QUIC / HTTP/3 edge transport | Fire-and-forget telemetry ticks. Dropping a single telemetry frame under high network load is preferable to blocking worker threads with TCP head-of-line blocking. |

---

## 2. HTTP/2 & gRPC Multiplexing
- **Edge to Client**: Nginx and Vite SPA negotiate **HTTP/2** over TLS 1.3, multiplexing dozens of concurrent asset requests over a single TCP socket.
- **Internal Service-to-Service**: Internal gRPC microservice calls use HTTP/2 with binary Protobuf encoding, reducing serialization overhead by 68% compared to JSON.

---

## 3. TCP Keepalive & Pool Tuning

In Node.js microservices, standard HTTP agents destroy sockets after each request unless configured. KineticFit standardizes on tuned `http.Agent` and `https.Agent`:
- `keepAlive: true`
- `keepAliveMsecs: 30000` (30 seconds)
- `maxSockets: 100` per host
- `maxFreeSockets: 25`
- `TCP_NODELAY: true` (disables Nagle's algorithm for low-latency command dispatch)
