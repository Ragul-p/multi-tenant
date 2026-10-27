import { Injectable } from '@nestjs/common';
export type PaymentResult = { status: 'SUCCESS' | 'FAILED'; providerReference: string };
export interface PaymentProvider { charge(amountPaise: number, idempotencyKey: string): Promise<PaymentResult>; }
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async charge(amountPaise: number, idempotencyKey: string): Promise<PaymentResult> {
    const mode = process.env.MOCK_PAYMENT_MODE === 'FAILED' ? 'FAILED' : 'SUCCESS';
    return {
      status: amountPaise > 0 ? mode : 'FAILED',
      providerReference: `mock-${idempotencyKey}`
    };
  }
}
