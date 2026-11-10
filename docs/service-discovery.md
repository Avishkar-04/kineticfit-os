# KineticFit OS - Service Discovery & Networking Architecture

This document describes service discovery, CoreDNS optimization, gRPC load balancing, and health-gated registration across Docker Compose and Kubernetes environments.

---

## 1. Kubernetes DNS & CoreDNS Tuning

### Problem: DNS Resolution Cascades & `ndots: 5`
In standard Kubernetes, the default `resolv.conf` specifies `ndots: 5`. Any query with fewer than 5 dots iterates through:
1. `<domain>.kineticfit.svc.cluster.local`
2. `<domain>.svc.cluster.local`
3. `<domain>.cluster.local`
4. Root external search

This produces up to 4 sequential DNS queries for every external or short-named network call.

### Solution: KineticFit `dnsConfig`
For high-throughput microservices (`scheduling-service`, `access-service`), we tune `dnsConfig`:

```yaml
spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
      - name: edns0
```

- Fully-qualified internal cluster addresses are used: `postgres-primary.kineticfit.svc.cluster.local`
- `NodeLocal DNSCache` is enabled on production EKS clusters, serving 99.4% of DNS lookups from local host-cache in < 0.5 ms.

---

## 2. Headless Services & Client-Side gRPC Load Balancing

### gRPC L7 vs L4 Load Balancing
gRPC connections utilize HTTP/2 persistent multiplexed TCP streams. A standard Kubernetes `ClusterIP` Service balances at L4 (TCP connection level), resulting in all gRPC RPC calls routing to a single pod indefinitely.

### Headless Service Architecture
1. Microservices expose a headless Service with `clusterIP: None`.
2. CoreDNS returns an `A`/`AAAA` record containing all ready pod IPs.
3. The internal gRPC client uses round-robin client-side load balancing (`grpc.lb_policy_name=round_robin`) with periodic endpoint re-resolution.

---

## 3. Health-Gated Registration & Zero-Downtime Drains

- **Readiness Gate**: Pods are only added to Service endpoints after passing `/health/ready` (validating database pool connectivity, cache availability, and message broker readiness).
- **Graceful Drain (`preStop` Hook)**:
  1. Kubernetes marks pod as `Terminating` and removes it from Service endpoints.
  2. Container runs `preStop: exec ["/bin/sh", "-c", "sleep 5"]` giving Ingress and mesh proxies time to stop directing new requests.
  3. Node.js process receives `SIGTERM`.
  4. Server calls `app.close()`, drains in-flight HTTP requests and WebSockets.
  5. Connection pools and Redis clients close cleanly within `terminationGracePeriodSeconds: 30`.
