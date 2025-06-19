import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { ThrottlerGuard } from '@nestjs/throttler';
  import { NotificationService } from '../services/notification.service';
  import { EmailService } from '../services/email.service';
  import { SmsService } from '../services/sms.service';
  import { TemplateService } from '../services/template.service';
  import {
    CreateNotificationDto,
    CreateTemplateDto,
  } from '../dto/notification.dto';
  import { SendEmailDto, BulkEmailDto } from '../dto/email.dto';
  import { SendSmsDto, BulkSmsDto } from '../dto/sms.dto';
  
  @Controller('notifications')
  @UseGuards(ThrottlerGuard)
  export class NotificationController {
    constructor(
      private readonly notificationService: NotificationService,
      private readonly emailService: EmailService,
      private readonly smsService: SmsService,
      private readonly templateService: TemplateService,
    ) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
      return this.notificationService.createNotification(createNotificationDto);
    }
  
    @Post('email/send')
    @HttpCode(HttpStatus.OK)
    async sendEmail(@Body() sendEmailDto: SendEmailDto) {
      return this.emailService.sendEmail(sendEmailDto);
    }
  
    @Post('email/bulk')
    @HttpCode(HttpStatus.OK)
    async sendBulkEmail(@Body() bulkEmailDto: BulkEmailDto) {
      return this.emailService.sendBulkEmails(bulkEmailDto);
    }
  
    @Post('sms/send')
    @HttpCode(HttpStatus.OK)
    async sendSms(@Body() sendSmsDto: SendSmsDto) {
      return this.smsService.sendSms(sendSmsDto);
    }
  
    @Post('sms/bulk')
    @HttpCode(HttpStatus.OK)
    async sendBulkSms(@Body() bulkSmsDto: BulkSmsDto) {
      return this.smsService.sendBulkSms(bulkSmsDto);
    }
  
    @Get('history')
    async getNotificationHistory(
      @Query('page') page = 1,
      @Query('limit') limit = 20,
      @Query('type') type?: string,
    ) {
      return this.notificationService.getHistory(page, limit, type);
    }
  
    @Post('templates')
    @HttpCode(HttpStatus.CREATED)
    async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
      return this.templateService.createTemplate(createTemplateDto);
    }
  
    @Get('templates')
    async getTemplates(@Query('type') type?: string) {
      return this.templateService.getTemplates(type);
    }
  
    @Get('templates/:name')
    async getTemplate(@Param('name') name: string) {
      return this.templateService.getTemplate(name);
    }
  }