import { Injectable } from '@nestjs/common';
import { SmsProvider } from './sms.interface';
import { TwilioSmsProvider } from './twilio.provider';

@Injectable()
export class SmsProviderFactory {
  createProvider(): SmsProvider {
    const provider = process.env.SMS_PROVIDER || 'twilio';
    
    switch (provider) {
      case 'twilio':
      default:
        return new TwilioSmsProvider();
    }
  }
}