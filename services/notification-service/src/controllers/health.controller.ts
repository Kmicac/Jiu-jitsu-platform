import { Controller, Get } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Controller('health')
export class HealthController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async check() {
    const health = await this.notificationService.getHealthStatus();
    return {
      status: 'OK',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      ...health,
    };
  }

  @Get('ready')
  async ready() {
    return {
      status: 'ready',
      service: 'notification-service',
    };
  }

  @Get('live')
  async live() {
    return {
      status: 'alive',
      service: 'notification-service',
    };
  }
}