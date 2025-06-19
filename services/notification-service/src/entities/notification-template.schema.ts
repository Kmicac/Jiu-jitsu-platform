import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum TemplateCategory {
  AUTHENTICATION = 'authentication',
  TRANSACTION = 'transaction',
  MARKETING = 'marketing',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

@Schema({
  timestamps: true,
  collection: 'notification_templates',
  versionKey: false,
})
export class NotificationTemplate {
  @Prop({ required: true, unique: true })
  templateId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: TemplateType,
    required: true,
  })
  type: TemplateType;

  @Prop({
    type: String,
    enum: TemplateCategory,
    required: true,
  })
  category: TemplateCategory;

  @Prop({ required: true })
  subject?: string; // Para emails

  @Prop({ required: true })
  content: string;

  @Prop()
  htmlContent?: string; // Para emails

  @Prop({ default: 'es' })
  language: string;

  @Prop({ type: Object })
  variables?: Record<string, any>; // Variables que se pueden usar en la plantilla

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  metadata?: Record<string, any>; // Metadatos adicionales

  @Prop()
  tags?: string[];

  @Prop()
  version?: number;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);