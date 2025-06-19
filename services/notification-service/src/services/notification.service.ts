import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { TemplateService } from './template.service';
import { CreateNotificationDto, NotificationType } from '../dto/notification.dto';
import { EmailNotification, EmailNotificationDocument } from '../entities/email-notification.schema';
import { SmsNotification, SmsNotificationDocument } from '../entities/sms-notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(EmailNotification.name)
    private emailModel: Model<EmailNotificationDocument>,
    @InjectModel(SmsNotification.name)
    private smsModel: Model<SmsNotificationDocument>,
    private emailService: EmailService,
    private smsService: SmsService,
    private templateService: TemplateService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    try {
      let content = dto.content;
      let subject = dto.subject;

      // Process template if provided
      if (dto.template) {
        const template = await this.templateService.getTemplate(dto.template);
        if (template) {
          content = this.templateService.processTemplate(template.content, dto.templateData || {});
          if (template.subject && dto.type === NotificationType.EMAIL) {
            subject = this.templateService.processTemplate(template.subject, dto.templateData || {});
          }
        }
      }

      // Send notification based on type
      switch (dto.type) {
        case NotificationType.EMAIL:
          return this.emailService.sendEmail({
            to: [dto.recipient],
            subject: subject || 'Notification',
            html: content,
          });

        case NotificationType.SMS:
          return this.smsService.sendSms({
            to: dto.recipient,
            message: content,
          });

        default:
          throw new Error(`Unsupported notification type: ${dto.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async getHistory(page = 1, limit = 20, type?: string) {
    const skip = (page - 1) * limit;
    const query = type ? { type } : {};

    const [emails, sms] = await Promise.all([
      this.emailModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.smsModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    return {
      emails,
      sms,
      pagination: {
        page,
        limit,
        total: await this.getTotalCount(query),
      },
    };
  }

  async getTotalCount(query: any): Promise<number> {
    const [emailCount, smsCount] = await Promise.all([
      this.emailModel.countDocuments(query),
      this.smsModel.countDocuments(query),
    ]);
    return emailCount + smsCount;
  }

  async getHealthStatus() {
    try {
      const [emailCount, smsCount] = await Promise.all([
        this.emailModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        this.smsModel.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      ]);

      return {
        database: 'connected',
        notifications: {
          emails_24h: emailCount,
          sms_24h: smsCount,
        },
      };
    } catch (error) {
      return {
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}