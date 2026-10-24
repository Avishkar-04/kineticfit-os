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

export class RazorpayProvider implements PaymentProvider {
  public readonly name = 'RAZORPAY' as const;

  async charge(params: ChargeParams): Promise<ChargeResult> {
    return {
      success: true,
      transactionId: `pay_${uuidv4().replace(/-/g, '').slice(0, 14)}`,
      amountCents: params.amountCents,
      currency: params.currency,
      status: 'SUCCEEDED'
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    return {
      success: true,
      refundId: `rfnd_${uuidv4().replace(/-/g, '').slice(0, 14)}`,
      amountCents: params.amountCents,
      status: 'SUCCEEDED'
    };
  }

  /**
   * Verifies Razorpay X-Razorpay-Signature header:
   * HMAC SHA256 of raw body against webhook secret.
   */
  verifyWebhook(rawBody: string, signature: string, secret: string): WebhookVerificationResult {
    const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))) {
      try {
        const parsed = JSON.parse(rawBody);
        return {
          isValid: true,
          event: {
            id: parsed.event_id || `evt_${uuidv4().slice(0, 8)}`,
            type: parsed.event || 'payment.captured',
            payload: parsed.payload || parsed,
            timestamp: Math.floor(Date.now() / 1000)
          }
        };
      } catch {
        return { isValid: false, reason: 'Malformed Razorpay JSON payload' };
      }
    }

    return { isValid: false, reason: 'Invalid Razorpay HMAC signature' };
  }
}
