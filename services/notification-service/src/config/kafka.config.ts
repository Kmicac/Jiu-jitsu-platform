import { ConfigService } from '@nestjs/config';
import { KafkaConfig } from 'kafkajs';

export const getKafkaConfig = (configService: ConfigService): KafkaConfig => {
  const brokers = configService.get<string>('KAFKA_BROKER', 'localhost:9092').split(',');
  const clientId = configService.get<string>('KAFKA_CLIENT_ID', 'notification-service');

  return {
    clientId,
    brokers,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
    connectionTimeout: 3000,
    authenticationTimeout: 1000,
    reauthenticationThreshold: 10000,
  };
};

export const getKafkaConsumerConfig = (configService: ConfigService) => {
  const groupId = configService.get<string>('KAFKA_GROUP_ID', 'notification-service-group');
  const sessionTimeout = configService.get<number>('KAFKA_SESSION_TIMEOUT', 30000);
  const heartbeatInterval = configService.get<number>('KAFKA_HEARTBEAT_INTERVAL', 3000);
  const maxBytesPerPartition = configService.get<number>('KAFKA_MAX_BYTES_PER_PARTITION', 1048576);

  return {
    groupId,
    sessionTimeout,
    heartbeatInterval,
    maxBytesPerPartition,
    allowAutoTopicCreation: false,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  };
};

export const getKafkaTopics = (configService: ConfigService) => ({
  userEvents: configService.get<string>('KAFKA_USER_EVENTS_TOPIC', 'user.events'),
  orderEvents: configService.get<string>('KAFKA_ORDER_EVENTS_TOPIC', 'order.events'),
  paymentEvents: configService.get<string>('KAFKA_PAYMENT_EVENTS_TOPIC', 'payment.events'),
});