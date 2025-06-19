import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { getKafkaConfig } from '../../config/kafka.config';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    // Usar la función de configuración con ConfigService
    const kafkaConfig = getKafkaConfig(this.configService);
    
    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async sendMessage(topic: string, message: any, key?: string) {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key,
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        }],
      });
      
      this.logger.log(`Message sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}:`, error);
      throw error;
    }
  }

  async sendBatch(topic: string, messages: Array<{ key?: string; value: any }>) {
    try {
      await this.producer.send({
        topic,
        messages: messages.map(msg => ({
          key: msg.key,
          value: JSON.stringify(msg.value),
          timestamp: Date.now().toString(),
        })),
      });
      
      this.logger.log(`Batch of ${messages.length} messages sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send batch to topic ${topic}:`, error);
      throw error;
    }
  }
}