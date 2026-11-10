# KineticFit OS Progressive Delivery & Rollback Drill (PowerShell)
$Namespace = "kineticfit"

Write-Host "=== KineticFit OS Progressive Delivery & Rollback Drill ===" -ForegroundColor Cyan

Write-Host "1. Checking current rollout status..."
kubectl argo rollouts get rollout scheduling-service-rollout -n $Namespace

Write-Host "2. Triggering Canary Rollout with new revision (v1.1.0)..."
kubectl argo rollouts set image scheduling-service-rollout scheduling-service=ghcr.io/kineticfit/scheduling-service:v1.1.0 -n $Namespace

Write-Host "3. Simulating metric anomaly detection & abort..."
kubectl argo rollouts abort scheduling-service-rollout -n $Namespace

Write-Host "4. Reverting to stable revision..."
kubectl argo rollouts undo scheduling-service-rollout -n $Namespace
kubectl argo rollouts status scheduling-service-rollout -n $Namespace

Write-Host "5. Promoting Blue-Green billing-service..."
kubectl argo rollouts promote billing-service-rollout -n $Namespace

Write-Host "=== Progressive Delivery Drill Finished ===" -ForegroundColor Green

