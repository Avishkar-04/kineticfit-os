# Runbook: TLS Certificate Expiring Soon (SEV3)

## Alert Overview
- **Alert Name**: `TlsCertificateExpiringSoon`
- **Severity**: SEV3
- **Trigger**: TLS certificate expiry date is less than 14 days away.

---

## 1. Customer Impact
If unresolved within 14 days, web browsers, mobile PWAs, and IoT turnstiles will reject HTTPS connections with TLS handshake failure (`NET::ERR_CERT_DATE_INVALID`). Immediate total gym outage if expired.

---

## 2. Dashboards
- **Grafana**: [Edge / Nginx & Kong Gateway](http://grafana.kineticfit.os/d/kf-edge-nginx-kong)
- **Blackbox Prober**: TLS Expiry dashboard

---

## 3. First 5 Diagnostic Checks
1. Identify the certificate resource in Kubernetes:
   ```bash
   kubectl get certificates -n kineticfit
   ```
2. Check cert-manager controller logs for renewal challenge failures (Let's Encrypt HTTP01 / DNS01 challenge):
   ```bash
   kubectl logs -n cert-manager -l app=cert-manager --tail=100
   ```
3. Check Cert-Manager `CertificateRequest` and `Order` objects:
   ```bash
   kubectl get certificaterequest,order,challenge -n kineticfit
   ```
4. Verify Route53 DNS propagation if using DNS-01 challenge.
5. Check if Ingress HTTP-01 route is blocked by Nginx WAF rule.

---

## 4. Immediate Mitigations
- Trigger manual renewal:
   ```bash
   kubectl cert-manager renew kineticfit-tls -n kineticfit
   ```
- If Let's Encrypt rate-limited: Switch to secondary ACME provider (ZeroSSL / Cloudflare) or import emergency corporate wildcard certificate.

---

## 5. Escalation Path
- Security & Cloud Infrastructure Team

