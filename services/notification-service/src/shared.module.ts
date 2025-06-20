import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';
import { EmailNotification, EmailNotificationSchema } from './entities/email-notification.schema';
import { SmsNotification, SmsNotificationSchema } from './entities/sms-notification.schema';
import { NotificationTemplate, NotificationTemplateSchema } from './entities/notification-template.schema';
import { EmailProviderFactory } from './providers/email/email.factory';
import { SmsProviderFactory } from './providers/sms/sms.factory';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailNotification.name, schema: EmailNotificationSchema },
      { name: SmsNotification.name, schema: SmsNotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
  ],
  providers: [
    EmailService,
    SmsService,
    TemplateService,
    EmailProviderFactory,
    SmsProviderFactory,
  ],
  exports: [
    EmailService,
    SmsService,
    TemplateService,
    MongooseModule,
  ],
})
export class SharedModule {}