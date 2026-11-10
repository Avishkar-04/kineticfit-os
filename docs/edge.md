# KineticFit OS - Edge, Reverse Proxy & API Gateway Architecture

KineticFit OS separates edge network concerns using a two-tier gateway architecture: **Nginx** at the outer perimeter (Layer 4/Layer 7 edge) and **Kong** as the internal API Gateway.

---

## 1. Nginx Edge Reverse Proxy Responsibilities
Located at `deploy/nginx/nginx.conf`:
- **TLS 1.3 & HSTS**: Terminates SSL/TLS with modern ciphers (`TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`) and strict transport security (`max-age=31536000; includeSubDomains; preload`).
- **Web Application Firewall (WAF)**: ModSecurity with OWASP Core Rule Set (CRS) actively inspecting and blocking SQL injection (`@detectSQLi`) and cross-site scripting (`@detectXSS`).
- **DDoS & Slowloris Mitigation**: Enforces strict client body/header timeouts (10s), connection limits per IP (50 concurrent), and burst rates.
- **Static Asset Serving & Compression**: Serves compiled React SPA assets with Brotli / Gzip pre-compression and 1-year immutable caching (`max-age=31536000, immutable`).

---

## 2. Kong Declarative API Gateway Responsibilities
Located at `deploy/kong/kong.yml`:
- **Authentication & JWT Verification**: Validates Ed25519 tokens against the `auth-service` JWKS endpoint before routing requests to upstream microservices.
- **Per-Consumer Rate Limiting**: Token-bucket rate limiting enforced per API key / member ID in Redis.
- **Canary & Progressive Traffic Routing**: Dynamic percentage-based routing between stable and candidate upstream services during Argo Rollouts.
- **CORS Handling**: Strict allowlist for frontend origins (`https://kineticfit.os`), rejecting wildcard credentials.
- **Observability Instrumentation**: Injects OpenTelemetry `traceparent` headers for distributed tracing propagation.
