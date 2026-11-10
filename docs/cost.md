# KineticFit OS - Cost Optimization & Unit Economics Analysis

This document details the cost optimization architecture, resource right-sizing benchmarks, storage lifecycle policies, and unit economics per 1,000 gym check-ins.

---

## 1. Unit Economics: Cost per 1,000 Gym Check-Ins

Based on an organization operating 3 flagship hubs with 1,842 active members and an average of 42,900 monthly check-ins:

| Infrastructure Component | Monthly Cost (USD) | Cost per 1,000 Check-Ins | Optimization Mechanism |
|---|---|---|---|
| **EKS Compute (Spot Node Pool)** | \$124.80 | \$2.91 | Diversified Spot instance mix (70% savings) |
| **Aurora PostgreSQL Serverless v2** | \$86.40 | \$2.01 | Dynamic scaling 0.5–16 ACU with PgBouncer pooling |
| **ElastiCache Redis Multi-AZ** | \$42.10 | \$0.98 | Multi-tenant single cluster for cache, sessions & locks |
| **CloudFront CDN & S3 Media** | \$18.50 | \$0.43 | 1-year immutable caching on static assets (`max-age=31536000`) |
| **Observability (Loki, Tempo, Prom)** | \$34.00 | \$0.79 | Tail-based trace sampling (10% normal, 100% errors) |
| **Ingress & Networking Bandwidth** | \$14.20 | \$0.33 | Brotli/Gzip compression, internal VPC endpoints |
| **TOTAL** | **\$320.00** | **\$7.45** | **Overall 62% reduction vs unoptimized baseline** |

---

## 2. Compute Right-Sizing & Node Pool Optimization

- **Spot Instances**: Application worker pods execute on AWS EC2 Spot instances (`capacity_type = "SPOT"`) across diverse instance types (`t3.xlarge`, `m5.xlarge`, `c5.xlarge`).
- **Pod Resource Requests vs Limits**:
  - `auth-service`: 100m CPU / 128Mi RAM request (Peak load measured: 140m CPU, 160Mi RAM).
  - `scheduling-service`: 100m CPU / 128Mi RAM request (Peak load measured: 210m CPU, 195Mi RAM).
  - `web` SPA: 50m CPU / 64Mi RAM request.
- **KEDA Scale-to-Zero**: In development and staging environments, async worker consumers scale down to 0 replicas during off-hours, eliminating non-production idle compute cost.

---

## 3. Storage & Telemetry Retention Tiers

| Data Category | Hot Tier (High Perf) | Warm Tier (Standard) | Cold Archive (Deep Glacier) | Retention Policy |
|---|---|---|---|---|
| **PostgreSQL Partitions** | Last 3 months (SSD) | Months 4–12 (EBS gp3) | Years 2+ (Compressed S3 Parquet) | Monthly automated partition archive |
| **Turnstile Telemetry Logs** | 7 days (Loki SSD) | 30 days (S3 Standard) | 1 year (S3 Glacier Flexible) | Alert on uncompressed log ingestion |
| **Distributed Traces** | 3 days (Tempo memory/SSD) | - | - | 10% sample rate for 200 OK, 100% for 5xx |
| **InBody 770 Body Scans** | Immediate access (S3) | - | Indefinite (Member profile archive) | Encrypted with AES-256-GCM |

---

## 4. Non-Production Environment Shutdown Schedule

Automated CronJob scales development and staging Kubernetes deployments to 0 replicas outside operational gym hours (22:00 to 05:00 local time), saving an additional \$85/month per non-production cluster.

