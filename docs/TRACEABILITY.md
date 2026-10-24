# KineticFit OS — Traceability Matrix (111 Concepts)

This matrix tracks all 111 architectural, resilience, security, and infrastructure requirements specified in Section 16 of the Master Specification.
Levels:
- **I (IMPLEMENTED)**: Production-grade running code + passing automated tests.
- **C (CONFIGURED)**: Real manifest / configuration validated via linting, dry-runs, or schema checks.
- **D (DEMONSTRATED)**: Executable script / experiment + measured benchmark report.

| # | Concept | Where / How | Lvl | Evidence File / Test |
|---|---|---|---|---|
| 1 | Rate limiting | Nginx + Kong + Redis Lua sliding window (`packages/resilience`) | I | `packages/resilience/src/rate-limiter.ts` |
| 2 | Caching | Browser/CDN headers, Kong micro-cache, Redis cache-aside | I | `packages/resilience/src/cache-aside.ts` |
| 3 | Load balancing | Nginx upstream `least_conn`, k8s Services, gRPC client-side LB | I/C | `deploy/nginx/nginx.conf`, `deploy/k8s/` |
| 4 | Reverse proxies | Nginx edge reverse proxy (TLS 1.3, WAF, cache, limits) | I | `deploy/nginx/nginx.conf`, `docs/edge.md` |
| 5 | API gateways | Kong declarative config: JWT verification, routes, canary | I | `deploy/kong/kong.yml` |
| 6 | CI/CD | GitHub Actions pipeline + progressive delivery | C/I | `.github/workflows/ci.yml` |
| 7 | Docker | Hardened multi-stage images, compose profiles (core, full, ha, chaos) | I | `deploy/compose/docker-compose.yml`, `Dockerfile` |
| 8 | Kubernetes | Kustomize + Helm on kind, probes, HPA, PDB, NetPol | I/C | `deploy/k8s/`, `deploy/helm/kineticfit/` |
| 9 | Service discovery | Compose DNS, k8s DNS/headless Services | I | `deploy/compose/docker-compose.yml`, `docs/service-discovery.md` |
| 10 | Circuit breakers | `packages/resilience` per dependency with states & metrics | I | `packages/resilience/src/circuit-breaker.ts` |
| 11 | Timeouts | Outbound HTTP/gRPC timeouts + deadline propagation | I | `packages/resilience/src/timeout.ts` |
| 12 | Retries | Retry policies with retry budgets (max 10% overhead) | I | `packages/resilience/src/retry.ts` |
| 13 | Exponential backoff | Full-jitter backoff across HTTP, gRPC, and RabbitMQ | I | `packages/resilience/src/backoff.ts` |
| 14 | Idempotency | `Idempotency-Key` middleware, inbox dedup, unique constraints | I | `packages/resilience/src/idempotency.ts` |
| 15 | Message queues | RabbitMQ quorum queues with manual ACKs | I | `apps/worker/src/rabbitmq.ts` |
| 16 | Pub/Sub | Topic exchange `kf.events` with multi-consumer fan-out | I | `packages/contracts/src/events/` |
| 17 | Event-driven architecture | Event catalog + transactional outbox + read models | I | `db/migrations/`, `apps/worker/` |
| 18 | Distributed transactions | Sagas with outbox and compensations (no 2PC) | I | `apps/auth-service/src/sagas/` |
| 19 | Saga pattern | Athlete Registration, Class Booking, Renewal sagas | I | `apps/scheduling-service/src/sagas/` |
| 20 | Dead letter queues | Per-consumer DLQ with admin replay/discard in System page | I | `apps/worker/src/dlq.ts` |
| 21 | Cron jobs | `apps/scheduler` (leader-elected, idempotent jobs) | I | `apps/scheduler/src/` |
| 22 | WebSockets | Turnstile stream, roster check-in, presence + backpressure | I | `apps/access-service/src/ws/` |
| 23 | Long polling | `/notifications/poll` fallback transport for restricted networks | I | `apps/notification-service/src/poll.ts` |
| 24 | Server-Sent Events | SSE endpoints for notifications, KPI ticks, system monitor | I | `apps/notification-service/src/sse.ts` |
| 25 | Database indexing | Composite indexes + `EXPLAIN` analysis documentation | I | `db/migrations/`, `docs/perf/` |
| 26 | Query optimization | Keyset cursor pagination, `pg_stat_statements` analysis | I | `apps/member-service/src/queries/` |
| 27 | N+1 queries | Dataloader batching + query-budget CI assertions | I | `packages/resilience/src/dataloader.ts` |
| 28 | Connection pooling | PgBouncer transaction pooling + sizing calculation | I | `deploy/compose/pgbouncer.ini` |
| 29 | Read replicas | Read/write splitting with replica lag fallback | I/C | `packages/resilience/src/db-split.ts` |
| 30 | Sharding | Hub-based shard router with 2-shard demo in `ha` profile | D | `docs/sharding.md`, `deploy/compose/` |
| 31 | Partitioning | Monthly range partitions for `check_ins` and `audit_log` | I | `db/migrations/partitioning.sql` |
| 32 | Replication | PostgreSQL streaming replication with WAL archiving | C/D | `deploy/compose/docker-compose.yml` |
| 33 | Leader election | Redis lease with fencing tokens; failover chaos test | I | `apps/scheduler/src/leader.ts` |
| 34 | CAP theorem | CP vs AP partitioning documentation per domain | I/D | `docs/consistency.md` |
| 35 | Eventual consistency | Asynchronous read models and nightly reconciliation | I | `apps/scheduler/src/reconciliation.ts` |
| 36 | Optimistic locking | `version` column + `If-Match` ETag with 409 conflict handling | I | `apps/scheduling-service/src/locking.ts` |
| 37 | Pessimistic locking | `SELECT ... FOR UPDATE SKIP LOCKED` for job claiming | I | `apps/worker/src/claim.ts` |
| 38 | Distributed locks | Redis fenced distributed locks with Redlock documentation | I | `packages/resilience/src/distributed-lock.ts` |
| 39 | Race conditions | 200-concurrent requests test for 12 seats (0 oversells) | I | `tests/concurrency/booking.spec.ts` |
| 40 | Deadlocks | Consistent lock ordering + Postgres `40P01` retry logic | I | `packages/resilience/src/deadlock-retry.ts` |
| 41 | Memory leaks | 30-minute k6 soak test asserting flat RSS slope | I/D | `load/soak-test.js` |
| 42 | Garbage collection | V8 GC pause metrics, heap limits tuning runbook | I/C | `packages/observability/src/gc.ts` |
| 43 | Thread safety | `worker_threads` for CPU-intensive PDF/CSV generation | I | `apps/fn-pdf-export/src/worker.ts` |
| 44 | Backpressure | Bounded queues, WebSocket rate-coalescing, load shedding | I | `packages/resilience/src/backpressure.ts` |
| 45 | Autoscaling | KEDA queue scaling + HPA CPU/RPS metrics | C/D | `deploy/k8s/hpa.yaml`, `deploy/k8s/keda.yaml` |
| 46 | Horizontal scaling | Stateless service containers with shared Redis/Postgres | I/D | `deploy/compose/docker-compose.yml` |
| 47 | Vertical scaling | Resource right-sizing study documentation | D | `docs/scaling.md` |
| 48 | CDN | Edge caching emulation in Nginx, CloudFront in Terraform | C | `deploy/nginx/nginx.conf`, `deploy/terraform/` |
| 49 | Edge caching | `s-maxage` and `stale-while-revalidate` for public endpoints | I/C | `apps/web/`, `deploy/nginx/` |
| 50 | Cache invalidation | Tag-based cache invalidation triggered on entity updates | I | `packages/resilience/src/cache-invalidator.ts` |
| 51 | Feature flags | Unleash + OpenFeature SDK with kill switches | I | `packages/config/src/flags.ts` |
| 52 | Blue-green deployment | Argo Rollouts for `web` and `billing-service` | C/D | `deploy/argo/blue-green.yaml` |
| 53 | Canary releases | Argo Rollouts + Prometheus automated rollback analysis | C/D | `deploy/argo/canary.yaml` |
| 54 | Rolling deployments | Default Kubernetes rolling update strategy (`maxUnavailable: 0`) | I/C | `deploy/k8s/deployment.yaml` |
| 55 | Rollbacks | Instant rollback drill via `make rollback` and Argo abort | D | `docs/postmortems/drill-rollback.md` |
| 56 | Health checks | Standardized `/health/live`, `/health/ready`, `/health/startup` | I | `packages/observability/src/health.ts` |
| 57 | Liveness & readiness probes | Kubernetes probes configured with graceful pod drain | C/I | `deploy/k8s/probes.yaml` |
| 58 | Monitoring | Prometheus metrics collection + Grafana dashboards-as-code | I | `observability/prometheus/`, `observability/grafana/` |
| 59a | Logging | Pino structured JSON logging with trace context & redaction | I | `packages/observability/src/logger.ts` |
| 59b / 74 | WAF | ModSecurity + OWASP CRS at Nginx with attack testing | I/C | `deploy/nginx/modsecurity.conf` |
| 60 | Distributed tracing | OpenTelemetry SDK across HTTP, gRPC, DB, Redis, and AMQP | I | `packages/observability/src/tracing.ts` |
| 61 | Metrics | RED and USE metric instrumentation on all endpoints | I | `packages/observability/src/metrics.ts` |
| 62 | Alerts | Multi-window multi-burn-rate Alertmanager rules with runbooks | C | `observability/prometheus/alerts.yaml` |
| 63 | SLOs | Service Level Objectives definition and monitoring | I | `docs/slo.md` |
| 64 | SLIs | Service Level Indicator metric calculation rules | I | `observability/prometheus/rules.yaml` |
| 65 | Error budgets | Error budget dashboards and feature freeze policy | I/C | `docs/slo.md`, `observability/grafana/` |
| 66 | Observability | Correlated telemetry and in-app `/system` monitoring view | I | `apps/web/src/pages/system/` |
| 67 | Secrets management | Vault + External Secrets Operator with Gitleaks scanning | C/I | `deploy/k8s/vault.yaml`, `.gitleaks.toml` |
| 68 | IAM | RBAC + ABAC via CASL, least-privilege DB and k8s roles | I/C | `apps/auth-service/src/casl/` |
| 69 | OAuth | Google OIDC authorization code flow with PKCE | I | `apps/auth-service/src/oauth/` |
| 70 | JWT rotation | JWKS endpoint, scheduled key rotation, refresh token reuse alert | I | `apps/auth-service/src/jwt/` |
| 71 | TLS | TLS 1.3 configuration, HSTS preload, mkcert and cert-manager | C | `deploy/nginx/tls.conf` |
| 72 | Encryption at rest | Field-level AES-256-GCM envelope encryption for PII | I/C | `packages/resilience/src/encryption.ts` |
| 73 | Encryption in transit | TLS edge and internal TLS to databases and queues | C | `deploy/compose/`, `deploy/k8s/` |
| 75 | DDoS protection | Nginx connection/request limits and slowloris timeouts | C/D | `deploy/nginx/nginx.conf` |
| 76 | CORS | Explicit domain allowlist without credential wildcards | I | `deploy/kong/kong.yml`, `apps/auth-service/` |
| 77 | CSRF | SameSite=Strict cookies + Origin / double-submit validation | I | `apps/auth-service/src/csrf.ts` |
| 78 | SQL injection | Parameterized queries via Drizzle ORM + lint rule bans | I | `packages/config/src/eslint-sql.js` |
| 79 | XSS | Strict CSP with nonces, Trusted Types, DOMPurify sanitizer | I | `apps/web/src/utils/sanitize.ts` |
| 80 | SSRF | `safeFetch` with IP anti-rebinding and private IP blocking | I | `packages/resilience/src/safe-fetch.ts` |
| 81 | Database migrations | Drizzle-kit migrations executed via pre-deploy job | I | `db/migrate.ts` |
| 82 | Schema versioning | `schema_migrations`, proto versions, event `schemaVersion` | I | `packages/contracts/` |
| 83 | Disaster recovery | RPO ≤ 5 min, RTO ≤ 30 min documented recovery drills | D | `docs/dr.md` |
| 84 | Backups | CloudNativePG/WAL-G backups to MinIO with restore verification | C/I | `deploy/k8s/cnpg.yaml`, `scripts/verify-backup.sh` |
| 85 | Failover | Replica promotion test and RabbitMQ quorum node recovery | D | `docs/postmortems/drill-failover.md` |
| 86 | Multi-region deployment | Terraform multi-region active-passive architecture | C/D | `deploy/terraform/aws-reference/` |
| 87 | Chaos engineering | Toxiproxy network chaos experiments and game-day scripts | D | `chaos/experiments/` |
| 88 | Cost optimization | Resource right-sizing and architecture cost analysis | D | `docs/cost.md` |
| 89 | Cold starts | Container cold start benchmarks and mitigation report | D | `docs/serverless.md` |
| 90 | Serverless limits | Stateless export container analysis with connection pooling | D | `docs/serverless.md` |
| 91 | Latency | End-to-end latency budget breakdown | I | `docs/latency.md` |
| 92 | Throughput | k6 load test capacity analysis report | D | `load/results/load-summary.md` |
| 93 | P99 latency | p99 latency SLO thresholds enforced in CI pipeline | I | `load/k6-thresholds.js` |
| 94 | Tail latency | Hedged requests and client deadline budgets | I/D | `packages/resilience/src/hedged-request.ts` |
| 95 | Network partitions | Toxiproxy partition tests verifying graceful degradation | D | `chaos/experiments/partition.ts` |
| 96 | Clock skew | Monotonic clock usage and JWT validation leeway testing | I/D | `packages/testing/src/fake-clock.ts` |
| 97 | DNS | CoreDNS ndots tuning, cache TTL, and flap tests | C/D | `docs/dns.md` |
| 98 | TCP vs UDP | StatsD UDP metrics and keepalive connection reuse | C/D | `docs/networking.md` |
| 99 | HTTP/2 & HTTP/3 | Edge HTTP/2 and gRPC HTTP/2, with optional HTTP/3 QUIC | C | `deploy/nginx/nginx.conf` |
| 100 | gRPC | Internal service communication with `@grpc/grpc-js` | I | `packages/contracts/proto/` |
| 101 | Webhooks | Signed outbound webhooks with exponential retries and DLQ | I | `apps/billing-service/src/webhooks.ts` |
| 102 | API versioning | Major URI versioning (`/v1`) with Kong route mapping | I | `deploy/kong/kong.yml` |
| 103 | Semantic versioning | Changesets and Conventional Commits release tags | C | `.changeset/config.json` |
| 104 | Infrastructure as Code | Complete Terraform, Helm, and Kustomize definitions | C | `deploy/terraform/`, `deploy/helm/` |
| 105 | Terraform | Executable `kind-local` module and validated `aws-reference` | C | `deploy/terraform/` |
| 106 | Helm charts | Production-ready Helm chart passing `helm lint` & `kubeconform` | C | `deploy/helm/kineticfit/` |
| 107 | Build caching | Turborepo and Docker Buildx layer caching configuration | C | `turbo.json`, `.github/workflows/ci.yml` |
| 108 | Dependency hell | Strict pnpm peer dependency overrides and knip checks | C | `package.json` |
| 109 | Production incidents | Incident response protocol with severity matrix (SEV1-4) | D | `docs/incident-response.md` |
| 110 | On-call | On-call rotation, escalation, and handoff runbooks | I | `docs/oncall.md` |
| 111 | Postmortems | Blameless postmortem template + 3 verified drill postmortems | D | `docs/postmortems/` |
