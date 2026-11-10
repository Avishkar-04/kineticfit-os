export interface ChargeParams {
  amountCents: number;
  currency: string;
  sourceToken?: string;
  idempotencyKey: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  success: boolean;
  transactionId: string;
  amountCents: number;
  currency: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  errorMessage?: string;
}

export interface RefundParams {
  transactionId: string;
  amountCents: number;
  reason?: string;
  idempotencyKey: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amountCents: number;
  status: 'SUCCEEDED' | 'FAILED';
  errorMessage?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: string;
  event?: {
    id: string;
    type: string;
    payload: Record<string, any>;
    timestamp: number;
  };
}

export interface PaymentProvider {
  readonly name: 'STRIPE' | 'RAZORPAY' | 'MOCK';
  charge(params: ChargeParams): Promise<ChargeResult>;
  refund(params: RefundParams): Promise<RefundResult>;
  verifyWebhook(rawBody: string, signature: string, secret: string, headerTimestamp?: number): WebhookVerificationResult;
}

