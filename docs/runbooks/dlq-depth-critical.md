# Runbook: Dead Letter Queue (DLQ) Depth Critical (SEV2)

## Alert Overview
- **Alert Name**: `DeadLetterQueueDepthCritical`
- **Severity**: SEV2
- **Trigger**: Messages present in any RabbitMQ Dead Letter Queue (`*.dlq`) for > 5 minutes.

---

## 1. Customer Impact
Asynchronous actions failed after all exponential retries exhausted:
- `kf.booking.dlq`: Failed waitlist auto-promotion or booking confirmation email.
- `kf.billing.dlq`: Unprocessed Stripe/Razorpay payment webhook or failed invoice generation.
- `kf.registration.dlq`: Incomplete member registration saga.

---

## 2. Dashboards
- **Grafana**: [RabbitMQ & Dead Letter Queues](http://grafana.kineticfit.os/d/kf-rabbitmq-dlq)
- **In-App DLQ Viewer**: Admin Portal -> `/system` -> **Dead Letter Queue** tab.

---

## 3. First 5 Diagnostic Checks
1. Open in-app `/system` DLQ inspector to see the poisoned message payload and error stack trace.
2. Determine if the error is data-specific (malformed JSON, unhandled schema version) or transient downstream dependency failure (external payment gateway timeout).
3. Check worker consumer logs:
   ```bash
   kubectl logs -n kineticfit -l app.kubernetes.io/name=billing-service | grep -i 'DLQ'
   ```
4. Verify schema contract version between publisher and consumer.
5. Check if downstream external service is healthy (Stripe/Razorpay status).

---

## 4. Immediate Mitigations
- **Transient Failure Resolved**:
  Use the **Replay Message** button on `/system` to push the message back into the main queue for immediate reprocessing.
- **Poison Pill Payload (Permanent Bug)**:
  1. Record message payload in incident ticket.
  2. Use **Discard Message** button on `/system` to prevent queue head-of-line blocking.
  3. Deploy patch with unit test reproducing the malformed payload.

---

## 5. Escalation Path
- Async Workers Team Lead
- Billing & Payments Engineer on-call
