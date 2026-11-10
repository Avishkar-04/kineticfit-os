#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="kineticfit"

echo "=== KineticFit OS Progressive Delivery & Rollback Drill ==="

echo "1. Checking current rollout status..."
kubectl argo rollouts get rollout scheduling-service-rollout -n "$NAMESPACE"

echo "2. Triggering Canary Rollout with new revision (v1.1.0)..."
kubectl argo rollouts set image scheduling-service-rollout scheduling-service=ghcr.io/kineticfit/scheduling-service:v1.1.0 -n "$NAMESPACE"

echo "3. Pausing at canary step 1 (5% traffic weight)..."
kubectl argo rollouts status scheduling-service-rollout -n "$NAMESPACE" --timeout=60s || true

echo "4. Simulating anomaly detection & automated abort drill..."
kubectl argo rollouts abort scheduling-service-rollout -n "$NAMESPACE"

echo "5. Verifying immediate rollback to stable replica set..."
kubectl argo rollouts undo scheduling-service-rollout -n "$NAMESPACE"
kubectl argo rollouts status scheduling-service-rollout -n "$NAMESPACE" --timeout=30s

echo "6. Testing Blue-Green Rollout Promotion on billing-service..."
kubectl argo rollouts set image billing-service-rollout billing-service=ghcr.io/kineticfit/billing-service:v1.1.0 -n "$NAMESPACE"
echo "Promoting active preview service to production..."
kubectl argo rollouts promote billing-service-rollout -n "$NAMESPACE"

echo "=== Rollback & Canary Drill Completed Successfully ==="
