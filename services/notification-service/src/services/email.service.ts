import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailProviderFactory } from '../providers/email/email.factory';
import { EmailProvider } from '../providers/email/email.interface';
import { EmailNotification, EmailNotificationDocument } from '../entities/email-notification.schema';
import { SendEmailDto, BulkEmailDto } from '../dto/email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailProvider: EmailProvider;

  constructor(
    @InjectModel(EmailNotification.name)
    private emailModel: Model<EmailNotificationDocument>,
    private emailProviderFactory: EmailProviderFactory,
  ) {
    this.emailProvider = this.emailProviderFactory.createProvider();
  }

  async sendEmail(emailDto: SendEmailDto) {
    try {
      const result = await this.emailProvider.sendEmail({
        to: emailDto.to,
        cc: emailDto.cc,
        bcc: emailDto.bcc,
        subject: emailDto.subject,
        text: emailDto.text,
        html: emailDto.html,
        attachments: emailDto.attachments,
      });

      // Save to database
      const emailRecord = new this.emailModel({
        to: emailDto.to,
        cc: emailDto.cc,
        bcc: emailDto.bcc,
        subject: emailDto.subject,
        content: emailDto.html || emailDto.text,
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined,
        messageId: result.messageId,
        error: result.error,
        metadata: {
          hasAttachments: !!emailDto.attachments?.length,
          template: emailDto.template,
        },
      });

      await emailRecord.save();

      this.logger.log(`Email ${result.success ? 'sent' : 'failed'} to ${emailDto.to}`);
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendBulkEmails(bulkDto: BulkEmailDto) {
    const results = [];
    const batchSize = bulkDto.batchSize || 10;

    for (let i = 0; i < bulkDto.emails.length; i += batchSize) {
      const batch = bulkDto.emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => this.sendEmail(email));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < bulkDto.emails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        this.logger.error(`Batch email error: ${error.message}`);
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    return {
      total: bulkDto.emails.length,
      successful,
      failed,
      results,
    };
  }

  async getEmailHistory(limit = 100, status?: string) {
    const query = status ? { status } : {};
    return this.emailModel.find(query).limit(limit).sort({ createdAt: -1 });
  }
}