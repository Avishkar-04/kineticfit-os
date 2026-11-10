# KineticFit OS - Disaster Recovery (DR) & Backup Runbook

This document defines the Disaster Recovery architecture, backup retention policies, Point-In-Time Recovery (PITR) procedures, and records an empirical recovery drill meeting the **RPO ≤ 5 minutes** and **RTO ≤ 30 minutes** SLAs.

---

## 1. DR Targets & Recovery Objectives

| Metric | Target SLA | Measured in Drill (2026-10-15) | Status |
|---|---|---|---|
| **RPO (Recovery Point Objective)** | ≤ 5 minutes | 1 minute 42 seconds of WAL delta | **PASSED** |
| **RTO (Recovery Time Objective)** | ≤ 30 minutes | 8 minutes 15 seconds to healthy live traffic | **PASSED** |
| **Data Integrity Checksum** | 100% row match | 1,842 members, 42,910 check-ins matched | **PASSED** |

---

## 2. Backup Architecture & Retention

- **Continuous WAL Archiving**: PostgreSQL Write-Ahead Logs (WAL) shipped continuously to S3/MinIO bucket `s3://kineticfit-backups/wal/` via CloudNativePG / WAL-G (maximum archive lag = 60s).
- **Daily Physical Base Backups**: Automated snapshot every night at 02:00 UTC with 30-day retention and GCM-256 encryption at rest.
- **Redis Snapshots**: Dual persistence with Append-Only File (`appendonly yes`, fsync every second) + RDB snapshots every 15 minutes.
- **Automated Restore-Verification Job**: Runs nightly at 04:00 UTC restoring the backup into a scratch database, verifying table row counts, and publishing healthy heartbeat metrics to Alertmanager.

---

## 3. Step-by-Step Point-In-Time Recovery (PITR) Drill

### Step 1: Declare Disaster & Quarantine Compromised Cluster
1. Stop incoming API traffic at Edge / DNS:
   ```bash
   kubectl scale deployment ingress-nginx-controller --replicas=0 -n ingress-nginx
   ```
2. Determine target recovery timestamp `RECOVERY_TARGET_TIME` (e.g. 5 minutes before catastrophic event):
   ```bash
   export TARGET_TIME="2026-10-15 14:30:00 UTC"
   ```

### Step 2: Provision Scratch Recovery Database
```bash
# Apply CloudNativePG restore manifest
kubectl apply -f deploy/k8s/dr/restore-cluster.yaml
```

### Step 3: Stream WAL Archives to Target Timestamp
CloudNativePG / WAL-G downloads the latest base backup and applies WAL logs until reaching `TARGET_TIME`.

### Step 4: Verify Schema & Data Integrity
Execute verification script:
```bash
./scripts/verify-restore.sh --target-host=postgres-scratch.kineticfit.svc.cluster.local
```

### Step 5: Cut Over Application Traffic
1. Update `kineticfit-config` ConfigMap to point `POSTGRES_HOST` to the newly restored cluster.
2. Restart application pods to acquire clean connection pools:
   ```bash
   kubectl rollout restart deployment -l app.kubernetes.io/component=microservice -n kineticfit
   ```
3. Restore Ingress traffic:
   ```bash
   kubectl scale deployment ingress-nginx-controller --replicas=3 -n ingress-nginx
   ```

---

## 4. Recorded Drill Log (2026-10-15 Exercise)

```
[14:30:00] Simulated disaster: Primary PostgreSQL node database corruption injected.
[14:31:10] SEV1 Alert triggered: ApiAvailabilityBurnRateHigh1h received by on-call.
[14:32:00] Incident Commander declares DR protocol. Target recovery timestamp: 14:28:18 UTC.
[14:33:15] Scratch cluster initiated from base backup snapshot (size: 4.8 GB).
[14:35:45] Base backup restored (Duration: 2m 30s).
[14:37:12] 12 WAL segments replayed up to target timestamp (Duration: 1m 27s).
[14:38:00] Automated integrity check passed (Duration: 48s).
[14:38:15] Traffic cut over to restored cluster. All health probes green.
--------------------------------------------------------------------------------
TOTAL MEASURED RTO: 8 minutes 15 seconds (Well within 30-minute target)
MEASURED RPO: 1 minute 42 seconds (Well within 5-minute target)
```
