import {
    IsString,
    IsEnum,
    IsOptional,
    IsObject,
    IsArray,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export enum NotificationType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
  }
  
  export enum NotificationPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
  }
  
  export class CreateNotificationDto {
    @IsEnum(NotificationType)
    type: NotificationType;
  
    @IsString()
    recipient: string;
  
    @IsString()
    subject?: string;
  
    @IsString()
    content: string;
  
    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority = NotificationPriority.NORMAL;
  
    @IsOptional()
    @IsString()
    template?: string;
  
    @IsOptional()
    @IsObject()
    templateData?: Record<string, any>;
  
    @IsOptional()
    @IsString()
    scheduledAt?: Date;
  
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
  }
  
  export class CreateTemplateDto {
    @IsString()
    name: string;
  
    @IsEnum(NotificationType)
    type: NotificationType;
  
    @IsString()
    subject?: string;
  
    @IsString()
    content: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    variables?: string[];
  
    @IsOptional()
    @IsString()
    description?: string;
  }