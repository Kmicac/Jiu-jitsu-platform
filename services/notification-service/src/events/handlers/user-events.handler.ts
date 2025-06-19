import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../services/email.service';
import { SmsService } from '../../services/sms.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class UserEventsHandler {
  private readonly logger = new Logger(UserEventsHandler.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private templateService: TemplateService,
  ) {}

  async handle(topic: string, payload: any) {
    switch (topic) {
      case 'user.registered':
        await this.handleUserRegistered(payload);
        break;
      case 'user.verified':
        await this.handleUserVerified(payload);
        break;
      case 'user.password_reset':
        await this.handlePasswordReset(payload);
        break;
    }
  }

  private async handleUserRegistered(payload: any) {
    try {
      const template = await this.templateService.getTemplate('welcome_email');
      
      if (template && payload.email) {
        await this.emailService.sendEmail({
          to: [payload.email],
          subject: this.templateService.processTemplate(template.subject || '', {
            name: payload.name || 'Usuario',
          }),
          html: this.templateService.processTemplate(template.content, {
            name: payload.name || 'Usuario',
            email: payload.email,
          }),
        });
      }

      this.logger.log(`Welcome email sent to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }

  private async handleUserVerified(payload: any) {
    this.logger.log('User verified notification processed');
    // Implement verification success notification
  }

  private async handlePasswordReset(payload: any) {
    try {
      if (payload.email && payload.resetToken) {
        await this.emailService.sendEmail({
          to: [payload.email],
          subject: 'Recuperación de Contraseña - Jiu Jitsu Platform',
          html: `
            <h2>Recuperación de Contraseña</h2>
            <p>Hola ${payload.name || 'Usuario'},</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <a href="${payload.resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Restablecer Contraseña
            </a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          `,
        });
      }

      this.logger.log(`Password reset email sent to ${payload.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
    }
  }
}