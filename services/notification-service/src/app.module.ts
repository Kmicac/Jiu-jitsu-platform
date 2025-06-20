import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { NotificationController } from './controllers/notification.controller';
import { HealthController } from './controllers/health.controller';

import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';

import { KafkaModule } from './events/kafka/kafka.module';

import { EmailNotification, EmailNotificationSchema } from './entities/email-notification.schema';
import { SmsNotification, SmsNotificationSchema } from './entities/sms-notification.schema';
import { NotificationTemplate, NotificationTemplateSchema } from './entities/notification-template.schema';

import { databaseConfig } from './config/database.config';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    MongooseModule.forRoot(databaseConfig.uri, databaseConfig.options),
    SharedModule,
    KafkaModule,
  ],
  controllers: [
    NotificationController,
    HealthController,
  ],
  providers: [
    NotificationService,
  ],
})
export class AppModule {}