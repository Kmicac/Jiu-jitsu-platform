import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions } from './email.interface';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || process.env.EMAIL_FROM,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        replyTo: options.replyTo,
      });

      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}