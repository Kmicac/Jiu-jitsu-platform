import { Module } from '@nestjs/common';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';
import { UserEventsHandler } from '../handlers/user-events.handler';
import { OrderEventsHandler } from '../handlers/order-events.handler';
import { PaymentEventsHandler } from '../handlers/payment-events.handler';
import { SharedModule } from '../../shared.module';

@Module({
  imports: [
    SharedModule
  ],
  providers: [
    KafkaProducer,
    KafkaConsumer,
    UserEventsHandler,
    OrderEventsHandler,
    PaymentEventsHandler,
  ],
  exports: [KafkaProducer, KafkaConsumer],
})
export class KafkaModule {}