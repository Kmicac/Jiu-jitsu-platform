import { Injectable } from '@nestjs/common';
import { EmailProvider } from './email.interface';
import { SmtpEmailProvider } from './smtp.provider';
import { SendGridEmailProvider } from './sendgrid.provider';

@Injectable()
export class EmailProviderFactory {
  createProvider(): EmailProvider {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';
    
    switch (provider) {
      case 'sendgrid':
        return new SendGridEmailProvider();
      case 'smtp':
      default:
        return new SmtpEmailProvider();
    }
  }
}