export interface SmsOptions {
    to: string;
    message: string;
    from?: string;
  }
  
  export interface SmsProvider {
    sendSms(options: SmsOptions): Promise<{
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }