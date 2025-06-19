import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmsProviderFactory } from '../providers/sms/sms.factory';
import { SmsProvider } from '../providers/sms/sms.interface';
import { SmsNotification, SmsNotificationDocument } from '../entities/sms-notification.schema';
import { SendSmsDto, BulkSmsDto } from '../dto/sms.dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private smsProvider: SmsProvider;

  constructor(
    @InjectModel(SmsNotification.name)
    private smsModel: Model<SmsNotificationDocument>,
    private smsProviderFactory: SmsProviderFactory,
  ) {
    this.smsProvider = this.smsProviderFactory.createProvider();
  }

  async sendSms(smsDto: SendSmsDto) {
    try {
      const result = await this.smsProvider.sendSms({
        to: smsDto.to,
        message: smsDto.message,
        from: smsDto.from,
      });

      // Save to database
      const smsRecord = new this.smsModel({
        to: smsDto.to,
        message: smsDto.message,
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined,
        messageSid: result.messageId,
        error: result.error,
        metadata: {
          template: smsDto.template,
          from: smsDto.from,
        },
      });

      await smsRecord.save();

      this.logger.log(`SMS ${result.success ? 'sent' : 'failed'} to ${smsDto.to}`);
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }

  async sendBulkSms(bulkDto: BulkSmsDto) {
    const results = [];
    const batchSize = bulkDto.batchSize || 5; // Smaller batches for SMS

    for (let i = 0; i < bulkDto.messages.length; i += batchSize) {
      const batch = bulkDto.messages.slice(i, i + batchSize);
      const batchPromises = batch.map(sms => this.sendSms(sms));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Longer delay between SMS batches (rate limiting)
        if (i + batchSize < bulkDto.messages.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        this.logger.error(`Batch SMS error: ${error.message}`);
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    return {
      total: bulkDto.messages.length,
      successful,
      failed,
      results,
    };
  }

  async getSmsHistory(limit = 100, status?: string) {
    const query = status ? { status } : {};
    return this.smsModel.find(query).limit(limit).sort({ createdAt: -1 });
  }
}