# KineticFit OS - Kind Cluster Provisioner for Windows
$ErrorActionPreference = "Stop"
$ClusterName = "kineticfit-local"

Write-Host "==> Checking kind cluster for KineticFit OS..." -ForegroundColor Cyan

$existingClusters = try { kind get clusters 2>$null } catch { @() }
if ($existingClusters -contains $ClusterName) {
    Write-Host "Cluster '$ClusterName' already exists." -ForegroundColor Green
} else {
    Write-Host "Creating cluster '$ClusterName' with ingress port mappings..." -ForegroundColor Yellow
    $config = @"
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
"@
    $tempConfig = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempConfig -Value $config
    kind create cluster --name $ClusterName --config $tempConfig
    Remove-Item $tempConfig -Force
}

Write-Host "==> Deploying NGINX Ingress controller for kind..." -ForegroundColor Cyan
try {
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
} catch {
    Write-Warning "Could not apply ingress-nginx automatically. Verify network access."
}

Write-Host "==> Kind cluster '$ClusterName' ready for KineticFit deployment!" -ForegroundColor Green

