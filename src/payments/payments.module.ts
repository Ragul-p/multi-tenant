import { Module } from '@nestjs/common';
import { MockPaymentProvider } from './payments.service';

@Module({ providers: [MockPaymentProvider], exports: [MockPaymentProvider] })
export class PaymentsModule {}
