import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';
import { SmsProvider, SmsOptions } from './sms.interface';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendSms(options: SmsOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.client) {
      return {
        success: false,
        error: 'Twilio client not configured',
      };
    }

    try {
      const result = await this.client.messages.create({
        body: options.message,
        from: options.from || process.env.TWILIO_PHONE_NUMBER,
        to: options.to,
      });

      this.logger.log(`SMS sent successfully: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}