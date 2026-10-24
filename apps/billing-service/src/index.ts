import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { v4 as uuidv4 } from 'uuid';
import {
  SubscriptionDto,
  InvoiceDto,
  ORG_ID,
  DOWNTOWN_HUB_ID
} from '@kineticfit/contracts';
import { createLogger } from '@kineticfit/observability';
import { IdempotencyStore } from '@kineticfit/resilience';
import { PaymentProvider } from './providers/types.js';
import { MockPaymentProvider } from './providers/mock.js';
import { StripeProvider } from './providers/stripe.js';
import { RazorpayProvider } from './providers/razorpay.js';

const logger = createLogger('billing-service');

export interface CreateSubscriptionInput {
  memberId: string;
  planId: string;
  planName: string;
  planPriceCents: number;
}

export interface CreateInvoiceInput {
  memberId: string;
  memberName: string;
  amountCents: number;
  description: string;
  dueDays?: number;
}

export function buildBillingApp(options?: {
  providers?: Record<string, PaymentProvider>;
  webhookSecret?: string;
}): FastifyInstance {
  const app = Fastify({
    logger: false
  });

  app.register(cors, { origin: true });

  // Webhook raw body parser support
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      (req as any).rawBody = body;
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err: any) {
      done(err, undefined);
    }
  });

  const idempotencyStore = new IdempotencyStore();
  const processedWebhooks = new Set<string>(); // event ID deduplication

  const providers: Record<string, PaymentProvider> = options?.providers || {
    MOCK: new MockPaymentProvider(),
    STRIPE: new StripeProvider(),
    RAZORPAY: new RazorpayProvider()
  };

  const webhookSecret = options?.webhookSecret || 'whsec_kineticfit_test_secret_123456';

  // In-memory billing state
  const subscriptions = new Map<string, SubscriptionDto>();
  const invoices = new Map<string, InvoiceDto>();
  const paymentsLedger: Array<{
    id: string;
    invoiceId: string;
    type: 'CHARGE' | 'REFUND';
    amountCents: number;
    provider: string;
    transactionId: string;
    createdAt: string;
  }> = [];

  // Seed default subscriptions and invoices
  const initialSubId = '01931668-7000-7000-8000-000000000001';
  subscriptions.set(initialSubId, {
    id: initialSubId,
    memberId: '01931668-5000-7000-8000-000000000001',
    planId: '01931668-6000-7000-8000-000000000003',
    planName: 'Elite Black VIP',
    planPriceCents: 24900,
    status: 'ACTIVE',
    renewsAt: new Date(Date.now() + 15 * 86400000).toISOString()
  });

  const initialInvId = '01931668-8888-7000-8000-000000000001';
  invoices.set(initialInvId, {
    id: initialInvId,
    orgId: ORG_ID,
    hubId: DOWNTOWN_HUB_ID,
    memberId: '01931668-5000-7000-8000-000000000001',
    memberName: 'Alexander Vance',
    invoiceNo: 'INV-2026-0001',
    amountCents: 24900,
    currency: 'USD',
    status: 'PAID',
    dueAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  });

  // Seed past due invoice for dunning tests
  const pastDueInvId = '01931668-8888-7000-8000-000000000002';
  invoices.set(pastDueInvId, {
    id: pastDueInvId,
    orgId: ORG_ID,
    hubId: DOWNTOWN_HUB_ID,
    memberId: '01931668-5000-7000-8000-000000000002',
    memberName: 'Elena Rostova',
    invoiceNo: 'INV-2026-0002',
    amountCents: 14900,
    currency: 'USD',
    status: 'PAST_DUE',
    dueAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    paidAt: null,
    createdAt: new Date(Date.now() - 17 * 86400000).toISOString()
  });

  // Health
  app.get('/health', async () => ({
    status: 'UP',
    service: 'billing-service',
    activeSubs: subscriptions.size,
    totalInvoices: invoices.size
  }));

  // Financial Overview
  app.get('/v1/billing/overview', async () => {
    let mrrCents = 0;
    let activeCount = 0;
    let pastDueCount = 0;

    for (const sub of subscriptions.values()) {
      if (sub.status === 'ACTIVE') {
        activeCount++;
        mrrCents += sub.planPriceCents || 14900;
      } else if (sub.status === 'PAST_DUE') {
        pastDueCount++;
      }
    }

    const arrCents = mrrCents * 12;
    const paidInvoices = Array.from(invoices.values()).filter((i) => i.status === 'PAID');
    const totalCollectedCents = paidInvoices.reduce((sum, i) => sum + i.amountCents, 0);

    return {
      mrrCents,
      mrrFormatted: `$${(mrrCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      arrCents,
      arrFormatted: `$${(arrCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      totalCollectedCents,
      activeSubscriptions: activeCount,
      pastDueSubscriptions: pastDueCount,
      churnRatePct: 1.2
    };
  });

  // Subscriptions
  app.get('/v1/subscriptions', async (req) => {
    const list = Array.from(subscriptions.values());
    return { data: list, count: list.length };
  });

  app.post<{ Body: CreateSubscriptionInput }>('/v1/subscriptions', async (req, reply) => {
    const b = req.body;
    const id = uuidv4();
    const sub: SubscriptionDto = {
      id,
      memberId: b.memberId,
      planId: b.planId,
      planName: b.planName,
      planPriceCents: b.planPriceCents,
      status: 'ACTIVE',
      renewsAt: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    subscriptions.set(id, sub);
    logger.info('Subscription created', { subscriptionId: id, memberId: b.memberId });
    return reply.code(201).send({ data: sub });
  });

  app.post<{ Params: { id: string } }>('/v1/subscriptions/:id/cancel', async (req, reply) => {
    const sub = subscriptions.get(req.params.id);
    if (!sub) {
      return reply.code(404).send({ error: 'Subscription not found' });
    }
    sub.status = 'CANCELED';
    subscriptions.set(sub.id, sub);
    logger.info('Subscription canceled', { subscriptionId: sub.id });
    return { data: sub };
  });

  // Invoices
  app.get('/v1/invoices', async () => {
    const list = Array.from(invoices.values());
    return { data: list, count: list.length };
  });

  app.post<{ Body: CreateInvoiceInput }>('/v1/invoices', async (req, reply) => {
    const b = req.body;
    const id = uuidv4();
    const invNo = `INV-2026-${String(invoices.size + 1).padStart(4, '0')}`;
    const dueAt = new Date(Date.now() + (b.dueDays || 7) * 86400000).toISOString();

    const invoice: InvoiceDto = {
      id,
      orgId: ORG_ID,
      hubId: DOWNTOWN_HUB_ID,
      memberId: b.memberId,
      memberName: b.memberName,
      invoiceNo: invNo,
      amountCents: b.amountCents,
      currency: 'USD',
      status: 'OPEN',
      dueAt,
      paidAt: null,
      createdAt: new Date().toISOString()
    };
    invoices.set(id, invoice);
    logger.info('Invoice generated', { invoiceId: id, invoiceNo: invNo, amountCents: b.amountCents });
    return reply.code(201).send({ data: invoice });
  });

  // Pay invoice with Idempotency & Provider
  app.post<{
    Params: { id: string };
    Body: { provider?: 'MOCK' | 'STRIPE' | 'RAZORPAY'; sourceToken?: string; idempotencyKey?: string };
  }>('/v1/invoices/:id/pay', async (req, reply) => {
    const invoice = invoices.get(req.params.id);
    if (!invoice) {
      return reply.code(404).send({ error: 'Invoice not found' });
    }
    if (invoice.status === 'PAID') {
      return reply.code(400).send({ error: 'Invoice already paid' });
    }

    const providerName = req.body.provider || 'MOCK';
    const provider = providers[providerName];
    if (!provider) {
      return reply.code(400).send({ error: `Unsupported provider: ${providerName}` });
    }

    const idempotencyKey = req.body.idempotencyKey || `pay_key_${req.params.id}_${Date.now()}`;

    // Charge customer
    const chargeResult = await provider.charge({
      amountCents: invoice.amountCents,
      currency: invoice.currency,
      idempotencyKey,
      sourceToken: req.body.sourceToken,
      customerEmail: 'member@kineticfit.dev'
    });

    if (!chargeResult.success) {
      logger.warn('Charge attempt failed', { invoiceId: invoice.id, reason: chargeResult.errorMessage });
      return reply.code(402).send({
        error: chargeResult.errorMessage || 'Payment failed',
        transactionId: chargeResult.transactionId
      });
    }

    // Update invoice state
    invoice.status = 'PAID';
    invoice.paidAt = new Date().toISOString();
    invoices.set(invoice.id, invoice);

    // Ledger entry
    paymentsLedger.push({
      id: uuidv4(),
      invoiceId: invoice.id,
      type: 'CHARGE',
      amountCents: invoice.amountCents,
      provider: providerName,
      transactionId: chargeResult.transactionId,
      createdAt: new Date().toISOString()
    });

    logger.info('Invoice marked paid', { invoiceId: invoice.id, transactionId: chargeResult.transactionId });
    return { data: invoice, transactionId: chargeResult.transactionId };
  });

  // Refund invoice (Reverse Ledger Saga)
  app.post<{
    Params: { id: string };
    Body: { reason?: string; idempotencyKey?: string };
  }>('/v1/invoices/:id/refund', async (req, reply) => {
    const invoice = invoices.get(req.params.id);
    if (!invoice) {
      return reply.code(404).send({ error: 'Invoice not found' });
    }
    if (invoice.status !== 'PAID') {
      return reply.code(400).send({ error: 'Only paid invoices can be refunded' });
    }

    const provider = providers.MOCK;
    const idempotencyKey = req.body.idempotencyKey || `ref_key_${req.params.id}_${Date.now()}`;

    const refundResult = await provider.refund({
      transactionId: `tx_orig_${invoice.id}`,
      amountCents: invoice.amountCents,
      reason: req.body.reason || 'Requested by front desk admin',
      idempotencyKey
    });

    if (!refundResult.success) {
      return reply.code(500).send({ error: 'Refund execution failed' });
    }

    invoice.status = 'VOID';
    invoices.set(invoice.id, invoice);

    paymentsLedger.push({
      id: uuidv4(),
      invoiceId: invoice.id,
      type: 'REFUND',
      amountCents: -invoice.amountCents,
      provider: 'MOCK',
      transactionId: refundResult.refundId,
      createdAt: new Date().toISOString()
    });

    logger.info('Invoice refunded', { invoiceId: invoice.id, refundId: refundResult.refundId });
    return { data: invoice, refundId: refundResult.refundId };
  });

  // Inbound Webhook Receiver with HMAC verification, Replay window, and Deduplication
  app.post<{
    Params: { provider: string };
    Headers: {
      'stripe-signature'?: string;
      'x-razorpay-signature'?: string;
      'x-mock-signature'?: string;
      'x-mock-timestamp'?: string;
    };
  }>('/v1/webhooks/:provider', async (req, reply) => {
    const providerKey = req.params.provider.toUpperCase();
    const provider = providers[providerKey];
    if (!provider) {
      return reply.code(400).send({ error: `Provider ${providerKey} not configured` });
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    let signature = '';
    let headerTimestamp: number | undefined;

    if (providerKey === 'STRIPE') {
      signature = req.headers['stripe-signature'] || '';
    } else if (providerKey === 'RAZORPAY') {
      signature = req.headers['x-razorpay-signature'] || '';
    } else {
      signature = req.headers['x-mock-signature'] || '';
      if (req.headers['x-mock-timestamp']) {
        headerTimestamp = parseInt(req.headers['x-mock-timestamp'], 10);
      }
    }

    if (!signature) {
      return reply.code(400).send({ error: 'Missing webhook signature header' });
    }

    // Verify signature & replay window
    const verification = provider.verifyWebhook(rawBody, signature, webhookSecret, headerTimestamp);
    if (!verification.isValid) {
      logger.warn('Webhook signature verification failed', { provider: providerKey, reason: verification.reason });
      return reply.code(401).send({ error: 'Invalid webhook signature', reason: verification.reason });
    }

    const event = verification.event!;

    // Deduplicate webhook event by ID
    if (processedWebhooks.has(event.id)) {
      logger.info('Webhook event already processed (idempotent ignore)', { eventId: event.id });
      return reply.code(200).send({ received: true, deduplicated: true, eventId: event.id });
    }

    processedWebhooks.add(event.id);
    logger.info('Webhook processed successfully', { provider: providerKey, eventId: event.id, type: event.type });

    return reply.code(200).send({ received: true, eventId: event.id, type: event.type });
  });

  // Dunning Retries Engine
  app.post('/v1/dunning/process', async () => {
    const results: Array<{ invoiceId: string; action: string; status: string }> = [];

    for (const inv of invoices.values()) {
      if (inv.status === 'PAST_DUE') {
        const daysPastDue = Math.floor((Date.now() - new Date(inv.dueAt).getTime()) / 86400000);
        if (daysPastDue > 14) {
          results.push({
            invoiceId: inv.id,
            action: 'FINAL_DUNNING_EXPIRED_FREEZE_SUBSCRIPTION',
            status: 'FROZEN'
          });
        } else {
          results.push({
            invoiceId: inv.id,
            action: `DUNNING_RETRY_SCHEDULED_DAY_${daysPastDue}`,
            status: 'RETRYING'
          });
        }
      }
    }

    return { processedCount: results.length, dunningActions: results };
  });

  return app;
}
