import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailNotification, EmailNotificationSchema } from '../entities/email-notification.schema';
import { NotificationTemplate, NotificationTemplateSchema } from '../entities/notification-template.schema';
import { SmsNotification, SmsNotificationSchema } from '../entities/sms-notification.schema';
// import { EmailService } from './services/email.service';
// import { SmsService } from './services/sms.service';
import { TemplateService } from './services/template.service';
// import { NotificationsController } from './controllers/notifications.controller';
// import { TemplatesController } from './controllers/templates.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailNotification.name, schema: EmailNotificationSchema },
      { name: SmsNotification.name, schema: SmsNotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
  ],
  // controllers: [NotificationsController, TemplatesController],
  providers: [// EmailService, SmsService, 
    TemplateService],
  exports: [ // EmailService, SmsService, 
    TemplateService],
})
export class NotificationsModule {}