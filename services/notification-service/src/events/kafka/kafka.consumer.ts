import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { getKafkaConfig, getKafkaConsumerConfig } from '../../config/kafka.config';
import { UserEventsHandler } from '../handlers/user-events.handler';
import { OrderEventsHandler } from '../handlers/order-events.handler';
import { PaymentEventsHandler } from '../handlers/payment-events.handler';

@Injectable()
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumer.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private userEventsHandler: UserEventsHandler,
    private orderEventsHandler: OrderEventsHandler,
    private paymentEventsHandler: PaymentEventsHandler,
  ) {
    // Usar las funciones de configuración con ConfigService
    const kafkaConfig = getKafkaConfig(this.configService);
    const consumerConfig = getKafkaConsumerConfig(this.configService);
    
    this.kafka = new Kafka(kafkaConfig);
    this.consumer = this.kafka.consumer(consumerConfig);
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    // Subscribe to topics
    await this.consumer.subscribe({
      topics: [
        'user.registered',
        'user.verified',
        'user.password_reset',
        'event.created',
        'event.updated',
        'event.registration',
        'order.created',
        'order.completed',
        'order.cancelled',
        'payment.success',
        'payment.failed',
      ],
    });

    await this.consumer.run({
      eachMessage: this.handleMessage.bind(this),
    });

    this.logger.log('Kafka consumer connected and listening');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }

  private async handleMessage({ topic, partition, message }: EachMessagePayload) {
    try {
      const payload = JSON.parse(message.value?.toString() || '{}');
      
      this.logger.log(`Processing message from topic: ${topic}`);

      switch (topic) {
        case 'user.registered':
        case 'user.verified':
        case 'user.password_reset':
          await this.userEventsHandler.handle(topic, payload);
          break;

        case 'event.created':
        case 'event.updated':
        case 'event.registration':
          await this.handleEventNotifications(topic, payload);
          break;

        case 'order.created':
        case 'order.completed':
        case 'order.cancelled':
          await this.orderEventsHandler.handle(topic, payload);
          break;

        case 'payment.success':
        case 'payment.failed':
          await this.paymentEventsHandler.handle(topic, payload);
          break;

        default:
          this.logger.warn(`Unhandled topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Error processing message from topic ${topic}:`, error);
    }
  }

  private async handleEventNotifications(topic: string, payload: any) {
    // Handle event-related notifications
    this.logger.log(`Event notification: ${topic}`, payload);
  }
}