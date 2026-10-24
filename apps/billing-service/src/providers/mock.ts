import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  PaymentProvider,
  ChargeParams,
  ChargeResult,
  RefundParams,
  RefundResult,
  WebhookVerificationResult
} from './types.js';

export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'MOCK' as const;
  private readonly transactions = new Map<string, ChargeResult>();
  private readonly refunds = new Map<string, RefundResult>();

  async charge(params: ChargeParams): Promise<ChargeResult> {
    // Check idempotency
    const existing = this.transactions.get(params.idempotencyKey);
    if (existing) {
      return existing;
    }

    if (params.sourceToken?.endsWith('0002')) {
      const failedResult: ChargeResult = {
        success: false,
        transactionId: `tx_mock_${uuidv4().slice(0, 8)}`,
        amountCents: params.amountCents,
        currency: params.currency,
        status: 'FAILED',
        errorMessage: 'Card declined: Insufficient funds'
      };
      this.transactions.set(params.idempotencyKey, failedResult);
      return failedResult;
    }

    const result: ChargeResult = {
      success: true,
      transactionId: `tx_mock_${uuidv4().slice(0, 8)}`,
      amountCents: params.amountCents,
      currency: params.currency,
      status: 'SUCCEEDED'
    };

    this.transactions.set(params.idempotencyKey, result);
    return result;
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const existing = this.refunds.get(params.idempotencyKey);
    if (existing) {
      return existing;
    }

    const result: RefundResult = {
      success: true,
      refundId: `rf_mock_${uuidv4().slice(0, 8)}`,
      amountCents: params.amountCents,
      status: 'SUCCEEDED'
    };
    this.refunds.set(params.idempotencyKey, result);
    return result;
  }

  verifyWebhook(rawBody: string, signature: string, secret: string, headerTimestamp?: number): WebhookVerificationResult {
    const now = Math.floor(Date.now() / 1000);
    const toleranceSec = 300; // 5 minutes

    if (headerTimestamp && Math.abs(now - headerTimestamp) > toleranceSec) {
      return { isValid: false, reason: 'Timestamp outside 300s replay window' };
    }

    const payloadToSign = headerTimestamp ? `${headerTimestamp}.${rawBody}` : rawBody;
    const expectedSig = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))) {
      try {
        const parsed = JSON.parse(rawBody);
        return {
          isValid: true,
          event: {
            id: parsed.id || `evt_${uuidv4().slice(0, 8)}`,
            type: parsed.type || 'payment.succeeded',
            payload: parsed.data || parsed,
            timestamp: headerTimestamp || now
          }
        };
      } catch {
        return { isValid: false, reason: 'Malformed JSON payload' };
      }
    }

    return { isValid: false, reason: 'Signature mismatch' };
  }
}
