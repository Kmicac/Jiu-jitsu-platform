import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { EmailProvider, EmailOptions } from './email.interface';

@Injectable()
export class SendGridEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name);

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(options: EmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const msg = {
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        from: options.from || process.env.EMAIL_FROM,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map(att => ({
          content: att.content.toString(),
          filename: att.filename,
          type: att.contentType,
        })),
        replyTo: options.replyTo,
      };

      const result = await sgMail.send(msg);
      
      this.logger.log(`Email sent successfully via SendGrid`);
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
      };
    } catch (error) {
      this.logger.error(`Failed to send email via SendGrid: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}