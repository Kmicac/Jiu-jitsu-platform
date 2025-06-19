import { Module } from '@nestjs/common';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';
import { UserEventsHandler } from '../handlers/user-events.handler';
import { OrderEventsHandler } from '../handlers/order-events.handler';
import { PaymentEventsHandler } from '../handlers/payment-events.handler';
import { EmailProviderFactory } from '../../providers/email/email.factory';
import { SmsProviderFactory } from '../../providers/sms/sms.factory';

@Module({
  providers: [
    KafkaProducer,
    KafkaConsumer,
    UserEventsHandler,
    OrderEventsHandler,
    PaymentEventsHandler,
    EmailProviderFactory,
    SmsProviderFactory,
  ],
  exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}