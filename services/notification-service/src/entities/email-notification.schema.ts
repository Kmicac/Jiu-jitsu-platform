import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailNotificationDocument = EmailNotification & Document;

export enum EmailNotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRY = 'retry',
  BOUNCED = 'bounced',
}

export enum EmailNotificationType {
  WELCOME = 'welcome',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  ORDER_CONFIRMATION = 'order_confirmation',
  EVENT_REGISTRATION = 'event_registration',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  NEWSLETTER = 'newsletter',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
  collection: 'email_notifications',
  versionKey: false,
})
export class EmailNotification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  to: string;

  @Prop()
  cc?: string[];

  @Prop()
  bcc?: string[];

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  htmlContent: string;

  @Prop()
  textContent?: string;

  @Prop({
    type: String,
    enum: EmailNotificationType,
    required: true,
  })
  type: EmailNotificationType;

  @Prop({
    type: String,
    enum: EmailNotificationStatus,
    default: EmailNotificationStatus.PENDING,
  })
  status: EmailNotificationStatus;

  @Prop()
  templateId?: string;

  @Prop({ type: Object })
  templateData?: Record<string, any>;

  @Prop()
  provider?: string;

  @Prop()
  providerMessageId?: string;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  openedAt?: Date;

  @Prop()
  clickedAt?: Date;

  @Prop()
  bouncedAt?: Date;

  @Prop()
  unsubscribedAt?: Date;

  @Prop()
  priority?: number;
}

export const EmailNotificationSchema = SchemaFactory.createForClass(EmailNotification);

// Índices para mejorar performance
EmailNotificationSchema.index({ userId: 1, status: 1 });
EmailNotificationSchema.index({ status: 1, scheduledAt: 1 });
EmailNotificationSchema.index({ type: 1, createdAt: -1 });
EmailNotificationSchema.index({ to: 1, type: 1 });
EmailNotificationSchema.index({ providerMessageId: 1 }, { sparse: true });