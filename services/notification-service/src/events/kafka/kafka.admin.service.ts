import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Admin } from 'kafkajs';
import { getKafkaConfig } from '../../config/kafka.config';

@Injectable()
export class KafkaAdminService {
  private readonly logger = new Logger(KafkaAdminService.name);
  private kafka: Kafka;
  private admin: Admin;

  constructor(private readonly configService: ConfigService) {
    const kafkaConfig = getKafkaConfig(this.configService);
    this.kafka = new Kafka(kafkaConfig);
    this.admin = this.kafka.admin();
  }

  async createTopics() {
    const topicsToCreate = [
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
    ];

    await this.admin.connect();
    const existingTopics = await this.admin.listTopics();

    const topicsToCreateFiltered = topicsToCreate.filter(
      (topic) => !existingTopics.includes(topic),
    );

    if (topicsToCreateFiltered.length > 0) {
      this.logger.log(
        `Creating topics: ${topicsToCreateFiltered.join(', ')}`,
      );
      await this.admin.createTopics({
        topics: topicsToCreateFiltered.map((topic) => ({ topic, numPartitions: 1, replicationFactor: 1 })),
      });
    } else {
      this.logger.log('All topics already exist.');
    }

    await this.admin.disconnect();
  }
}