import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SmsNotificationDocument = SmsNotification & Document;

export enum SmsNotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRY = 'retry',
  UNDELIVERED = 'undelivered',
}

export enum SmsNotificationType {
  VERIFICATION = 'verification',
  ALERT = 'alert',
  REMINDER = 'reminder',
  NOTIFICATION = 'notification',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
  collection: 'sms_notifications',
  versionKey: false,
})
export class SmsNotification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: SmsNotificationType,
    required: true,
  })
  type: SmsNotificationType;

  @Prop({
    type: String,
    enum: SmsNotificationStatus,
    default: SmsNotificationStatus.PENDING,
  })
  status: SmsNotificationStatus;

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
  priority?: number;

  @Prop()
  costInCents?: number;
}

export const SmsNotificationSchema = SchemaFactory.createForClass(SmsNotification);

// Índices para mejorar performance
SmsNotificationSchema.index({ userId: 1, status: 1 });
SmsNotificationSchema.index({ status: 1, scheduledAt: 1 });
SmsNotificationSchema.index({ type: 1, createdAt: -1 });
SmsNotificationSchema.index({ phoneNumber: 1, type: 1 });
SmsNotificationSchema.index({ providerMessageId: 1 }, { sparse: true });