import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  from: {
    name: string;
    address: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
  };
  retry: {
    maxRetries: number;
    delay: number;
    backoff: 'fixed' | 'exponential';
  };
}

export const getEmailConfig = (configService: ConfigService): EmailConfig => {
  const provider = configService.get<'smtp' | 'sendgrid' | 'mailgun'>('EMAIL_PROVIDER', 'smtp');
  
  const config: EmailConfig = {
    provider,
    from: {
      name: configService.get<string>('EMAIL_FROM_NAME', 'Jiu Jitsu Platform'),
      address: configService.get<string>('EMAIL_FROM_ADDRESS', 'noreply@jiujitsuplatform.com'),
    },
    retry: {
      maxRetries: configService.get<number>('EMAIL_MAX_RETRIES', 3),
      delay: configService.get<number>('EMAIL_RETRY_DELAY', 5000),
      backoff: configService.get<'fixed' | 'exponential'>('EMAIL_RETRY_BACKOFF', 'exponential'),
    },
  };

  if (provider === 'smtp') {
    config.smtp = {
      host: configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: configService.get<number>('SMTP_PORT', 587),
      secure: configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: configService.get<string>('SMTP_USER', ''),
        pass: configService.get<string>('SMTP_PASS', ''),
      },
    };
  }

  if (provider === 'sendgrid') {
    config.sendgrid = {
      apiKey: configService.get<string>('SENDGRID_API_KEY', ''),
    };
  }

  if (provider === 'mailgun') {
    config.mailgun = {
      apiKey: configService.get<string>('MAILGUN_API_KEY', ''),
      domain: configService.get<string>('MAILGUN_DOMAIN', ''),
    };
  }

  return config;
};