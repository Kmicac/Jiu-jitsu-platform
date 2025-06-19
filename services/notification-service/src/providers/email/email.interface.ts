export interface EmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
    path?: string;
  }
  
  export interface EmailOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: EmailAttachment[];
    from?: string;
    replyTo?: string;
  }
  
  export interface EmailProvider {
    sendEmail(options: EmailOptions): Promise<{
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }
  
  export interface EmailConfig {
    provider: 'smtp' | 'sendgrid';
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
    from: string;
  }