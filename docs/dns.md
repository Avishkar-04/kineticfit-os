# KineticFit OS - DNS Architecture & CoreDNS Tuning

This document describes the DNS optimization, CoreDNS parameters, TTL caching rules, and failure modes across Kubernetes and Docker Compose environments.

---

## 1. CoreDNS Tuning & `ndots: 2` Optimization

In standard Kubernetes, pod `resolv.conf` defaults to `ndots: 5`. Any network call with fewer than 5 dots (e.g. `api.stripe.com` or internal service names) triggers multiple sequential search domain lookups.

### KineticFit Specification
1. In high-traffic microservices (`scheduling-service`, `billing-service`), we configure:
   ```yaml
   dnsConfig:
     options:
       - name: ndots
         value: "2"
       - name: edns0
   ```
2. Fully qualified domain names (FQDNs) ending with a trailing dot are used for internal calls:
   `postgres-primary.kineticfit.svc.cluster.local.`
3. This eliminates up to 4 superfluous DNS queries per outbound HTTPS or database call.

---

## 2. NodeLocal DNSCache
For production EKS clusters, `NodeLocal DNSCache` runs as a DaemonSet:
- Listens on link-local IP `169.254.20.10`.
- Intercepts DNS queries locally without crossing network hops or iptables DNAT rules.
- Caches positive query responses for 30 seconds and negative responses for 5 seconds.
- Achieves 99.4% DNS cache hit ratio with p99 resolution latency < 0.8 ms.

---

## 3. DNS Failure & Flap Resilience
- If CoreDNS pods flap during cluster upgrades:
  - Microservices maintain an internal DNS cache using Node.js `dns.setServers()` and connection keepalive pools.
  - Existing TCP connections to PostgreSQL and Redis remain established without re-resolution.
