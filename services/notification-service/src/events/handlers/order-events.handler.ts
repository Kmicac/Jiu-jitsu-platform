import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../services/email.service';
import { SmsService } from '../../services/sms.service';
import { TemplateService } from '../../services/template.service';

@Injectable()
export class OrderEventsHandler {
  private readonly logger = new Logger(OrderEventsHandler.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private templateService: TemplateService,
  ) {}

  async handle(topic: string, payload: any) {
    switch (topic) {
      case 'order.created':
        await this.handleOrderCreated(payload);
        break;
      case 'order.completed':
        await this.handleOrderCompleted(payload);
        break;
      case 'order.cancelled':
        await this.handleOrderCancelled(payload);
        break;
    }
  }

  private async handleOrderCreated(payload: any) {
    try {
      const template = await this.templateService.getTemplate('order_confirmation');
      
      if (template && payload.customerEmail) {
        await this.emailService.sendEmail({
          to: [payload.customerEmail],
          subject: this.templateService.processTemplate(template.subject || '', {
            orderNumber: payload.orderNumber,
          }),
          html: this.templateService.processTemplate(template.content, {
            orderNumber: payload.orderNumber,
            total: payload.total,
            customerName: payload.customerName || 'Cliente',
            items: payload.items || [],
          }),
        });
      }

      this.logger.log(`Order confirmation sent for order ${payload.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error.message}`);
    }
  }

  private async handleOrderCompleted(payload: any) {
    try {
      if (payload.customerEmail) {
        await this.emailService.sendEmail({
          to: [payload.customerEmail],
          subject: `Pedido #${payload.orderNumber} Enviado`,
          html: `
            <h2>¡Tu pedido ha sido enviado!</h2>
            <p>Hola ${payload.customerName || 'Cliente'},</p>
            <p>Tu pedido #${payload.orderNumber} ha sido enviado.</p>
            ${payload.trackingNumber ? `<p><strong>Número de seguimiento:</strong> ${payload.trackingNumber}</p>` : ''}
            <p>Recibirás tu pedido en ${payload.estimatedDelivery || '3-5 días hábiles'}.</p>
            <p>¡Gracias por tu compra!</p>
          `,
        });
      }

      this.logger.log(`Order completion notification sent for order ${payload.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order completion notification: ${error.message}`);
    }
  }

  private async handleOrderCancelled(payload: any) {
    try {
      if (payload.customerEmail) {
        await this.emailService.sendEmail({
          to: [payload.customerEmail],
          subject: `Pedido #${payload.orderNumber} Cancelado`,
          html: `
            <h2>Pedido Cancelado</h2>
            <p>Hola ${payload.customerName || 'Cliente'},</p>
            <p>Tu pedido #${payload.orderNumber} ha sido cancelado.</p>
            ${payload.reason ? `<p><strong>Motivo:</strong> ${payload.reason}</p>` : ''}
            <p>Si el pago ya fue procesado, el reembolso se realizará en 3-5 días hábiles.</p>
            <p>Si tienes preguntas, no dudes en contactarnos.</p>
          `,
        });
      }

      this.logger.log(`Order cancellation notification sent for order ${payload.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order cancellation notification: ${error.message}`);
    }
  }
}