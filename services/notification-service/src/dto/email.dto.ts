import {
    IsEmail,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsObject,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class SendEmailDto {
    @IsArray()
    @IsEmail({}, { each: true })
    to: string[];
  
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    cc?: string[];
  
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    bcc?: string[];
  
    @IsString()
    subject: string;
  
    @IsOptional()
    @IsString()
    text?: string;
  
    @IsOptional()
    @IsString()
    html?: string;
  
    @IsOptional()
    @IsString()
    template?: string;
  
    @IsOptional()
    @IsObject()
    templateData?: Record<string, any>;
  
    @IsOptional()
    @IsArray()
    attachments?: Array<{
      filename: string;
      content: string;
      contentType?: string;
    }>;
  }
  
  export class BulkEmailDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SendEmailDto)
    emails: SendEmailDto[];
  
    @IsOptional()
    @IsString()
    batchSize?: number;
  }