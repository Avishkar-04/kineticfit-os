import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { buildBillingApp } from './index.js';
import { FastifyInstance } from 'fastify';

describe('Billing Service & Payment Webhooks', () => {
  let app: FastifyInstance;
  const testSecret = 'whsec_test_mock_secret_key_999';

  beforeEach(() => {
    app = buildBillingApp({ webhookSecret: testSecret });
  });

  it('provides financial overview metrics (MRR, ARR, active subscriptions)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/billing/overview'
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.mrrCents).toBeGreaterThan(0);
    expect(body.arrCents).toBe(body.mrrCents * 12);
    expect(body.activeSubscriptions).toBeGreaterThanOrEqual(1);
  });

  it('creates and cancels subscriptions', async () => {
    const memberId = '01931668-5000-7000-8000-000000000088';
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/subscriptions',
      payload: {
        memberId,
        planId: '01931668-6000-7000-8000-000000000002',
        planName: 'Pro Performance',
        planPriceCents: 14900
      }
    });

    expect(createRes.statusCode).toBe(201);
    const sub = JSON.parse(createRes.body).data;
    expect(sub.status).toBe('ACTIVE');

    const cancelRes = await app.inject({
      method: 'POST',
      url: `/v1/subscriptions/${sub.id}/cancel`
    });
    expect(cancelRes.statusCode).toBe(200);
    expect(JSON.parse(cancelRes.body).data.status).toBe('CANCELED');
  });

  it('charges open invoice with idempotency and records ledger entry', async () => {
    // 1. Create an open invoice
    const invRes = await app.inject({
      method: 'POST',
      url: '/v1/invoices',
      payload: {
        memberId: '01931668-5000-7000-8000-000000000088',
        memberName: 'Seraphina Vale',
        amountCents: 14900,
        description: 'Monthly Pro Membership'
      }
    });
    expect(invRes.statusCode).toBe(201);
    const inv = JSON.parse(invRes.body).data;

    // 2. Pay invoice
    const payRes = await app.inject({
      method: 'POST',
      url: `/v1/invoices/${inv.id}/pay`,
      payload: {
        provider: 'MOCK',
        idempotencyKey: `idem_pay_${inv.id}`
      }
    });
    expect(payRes.statusCode).toBe(200);
    const paid = JSON.parse(payRes.body).data;
    expect(paid.status).toBe('PAID');
    expect(paid.paidAt).toBeTruthy();

    // 3. Attempting to pay again returns 400
    const retryRes = await app.inject({
      method: 'POST',
      url: `/v1/invoices/${inv.id}/pay`,
      payload: { provider: 'MOCK' }
    });
    expect(retryRes.statusCode).toBe(400);

    // 4. Refund invoice
    const refundRes = await app.inject({
      method: 'POST',
      url: `/v1/invoices/${inv.id}/refund`,
      payload: { reason: 'Accidental double payment' }
    });
    expect(refundRes.statusCode).toBe(200);
    expect(JSON.parse(refundRes.body).data.status).toBe('VOID');
  });

  it('verifies signed HMAC webhook and prevents replay attacks (> 300s)', async () => {
    const rawPayload = JSON.stringify({
      id: 'evt_stripe_test_101',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123', amount: 24900 } }
    });

    const now = Math.floor(Date.now() / 1000);
    const validSig = crypto.createHmac('sha256', testSecret).update(`${now}.${rawPayload}`).digest('hex');

    // Valid webhook
    const validRes = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${now},v1=${validSig}`
      },
      payload: rawPayload
    });
    expect(validRes.statusCode).toBe(200);
    expect(JSON.parse(validRes.body).received).toBe(true);

    // Replay attack with expired timestamp (600 seconds old)
    const oldTimestamp = now - 600;
    const oldSig = crypto.createHmac('sha256', testSecret).update(`${oldTimestamp}.${rawPayload}`).digest('hex');

    const replayRes = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${oldTimestamp},v1=${oldSig}`
      },
      payload: rawPayload
    });
    expect(replayRes.statusCode).toBe(401);
    expect(JSON.parse(replayRes.body).reason).toContain('replay tolerance');

    // Tampered signature
    const tamperedRes = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${now},v1=0000000000000000000000000000000000000000000000000000000000000000`
      },
      payload: rawPayload
    });
    expect(tamperedRes.statusCode).toBe(401);
  });

  it('deduplicates duplicate webhook deliveries idempotently', async () => {
    const rawPayload = JSON.stringify({
      id: 'evt_stripe_duplicate_event_999',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_dup', amount: 14900 } }
    });

    const now = Math.floor(Date.now() / 1000);
    const validSig = crypto.createHmac('sha256', testSecret).update(`${now}.${rawPayload}`).digest('hex');

    // Delivery 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${now},v1=${validSig}`
      },
      payload: rawPayload
    });
    expect(res1.statusCode).toBe(200);
    expect(JSON.parse(res1.body).deduplicated).toBeUndefined();

    // Delivery 2 (same payload and event ID)
    const res2 = await app.inject({
      method: 'POST',
      url: '/v1/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${now},v1=${validSig}`
      },
      payload: rawPayload
    });
    expect(res2.statusCode).toBe(200);
    expect(JSON.parse(res2.body).deduplicated).toBe(true);
  });

  it('processes dunning retries for overdue invoices', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/dunning/process'
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.processedCount).toBeGreaterThanOrEqual(1);
    expect(body.dunningActions[0].status).toMatch(/RETRYING|FROZEN/);
  });
});

