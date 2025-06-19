import {
    IsString,
    IsOptional,
    IsPhoneNumber,
    IsArray,
    ValidateNested,
    IsObject,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class SendSmsDto {
    @IsPhoneNumber()
    to: string;
  
    @IsString()
    message: string;
  
    @IsOptional()
    @IsString()
    template?: string;
  
    @IsOptional()
    @IsObject()
    templateData?: Record<string, any>;
  
    @IsOptional()
    @IsString()
    from?: string;
  }
  
  export class BulkSmsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SendSmsDto)
    messages: SendSmsDto[];
  
    @IsOptional()
    @IsString()
    batchSize?: number;
  }