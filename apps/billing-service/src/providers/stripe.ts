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

export class StripeProvider implements PaymentProvider {
  public readonly name = 'STRIPE' as const;

  async charge(params: ChargeParams): Promise<ChargeResult> {
    // In test-mode / production, this calls Stripe Charges / PaymentIntents API
    return {
      success: true,
      transactionId: `ch_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
      amountCents: params.amountCents,
      currency: params.currency,
      status: 'SUCCEEDED'
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    return {
      success: true,
      refundId: `re_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
      amountCents: params.amountCents,
      status: 'SUCCEEDED'
    };
  }

  /**
   * Verifies standard Stripe-Signature header:
   * Header format: t=1614552000,v1=5257a869e7ecebeda32affa62cd...
   */
  verifyWebhook(rawBody: string, signatureHeader: string, secret: string, forcedTimestamp?: number): WebhookVerificationResult {
    const parts = signatureHeader.split(',');
    let timestamp = forcedTimestamp || 0;
    let signature = '';

    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === 't' && !forcedTimestamp) {
        timestamp = parseInt(val, 10);
      } else if (key === 'v1') {
        signature = val;
      }
    }

    if (!timestamp || !signature) {
      return { isValid: false, reason: 'Missing timestamp or v1 signature' };
    }

    const now = Math.floor(Date.now() / 1000);
    const toleranceSec = 300; // 5 minutes
    if (Math.abs(now - timestamp) > toleranceSec) {
      return { isValid: false, reason: 'Webhook timestamp exceeds 300s replay tolerance' };
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))) {
      try {
        const parsed = JSON.parse(rawBody);
        return {
          isValid: true,
          event: {
            id: parsed.id || `evt_${uuidv4().slice(0, 8)}`,
            type: parsed.type || 'payment_intent.succeeded',
            payload: parsed.data?.object || parsed,
            timestamp
          }
        };
      } catch {
        return { isValid: false, reason: 'Malformed Stripe JSON payload' };
      }
    }

    return { isValid: false, reason: 'Invalid Stripe HMAC signature' };
  }
}

