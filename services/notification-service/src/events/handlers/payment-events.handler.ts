import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../services/email.service';
import { SmsService } from '../../services/sms.service';

@Injectable()
export class PaymentEventsHandler {
  private readonly logger = new Logger(PaymentEventsHandler.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async handle(topic: string, payload: any) {
    switch (topic) {
      case 'payment.success':
        await this.handlePaymentSuccess(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
    }
  }

  private async handlePaymentSuccess(payload: any) {
    try {
      if (payload.customerEmail) {
        await this.emailService.sendEmail({
          to: [payload.customerEmail],
          subject: `Pago Confirmado - ${payload.amount}`,
          html: `
            <h2>¡Pago Confirmado!</h2>
            <p>Hola ${payload.customerName || 'Cliente'},</p>
            <p>Hemos recibido tu pago exitosamente.</p>
            <p><strong>Monto:</strong> ${payload.amount}</p>
            <p><strong>ID de Transacción:</strong> ${payload.transactionId}</p>
            ${payload.orderNumber ? `<p><strong>Pedido:</strong> #${payload.orderNumber}</p>` : ''}
            <p>Gracias por tu compra.</p>
          `,
        });
      }

      // Send SMS notification for high-value transactions
      if (payload.customerPhone && payload.amount > 1000) {
        await this.smsService.sendSms({
          to: payload.customerPhone,
          message: `Pago confirmado por ${payload.amount}. ID: ${payload.transactionId}. Gracias!`,
        });
      }

      this.logger.log(`Payment success notification sent for transaction ${payload.transactionId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment success notification: ${error.message}`);
    }
  }

  private async handlePaymentFailed(payload: any) {
    try {
      if (payload.customerEmail) {
        await this.emailService.sendEmail({
          to: [payload.customerEmail],
          subject: 'Error en el Pago',
          html: `
            <h2>Error en el Pago</h2>
            <p>Hola ${payload.customerName || 'Cliente'},</p>
            <p>Tu pago no pudo ser procesado.</p>
            ${payload.reason ? `<p><strong>Motivo:</strong> ${payload.reason}</p>` : ''}
            <p>Por favor, verifica los datos de tu tarjeta e intenta nuevamente.</p>
            <p>Si el problema persiste, contacta a tu banco o a nuestro soporte.</p>
          `,
        });
      }

      this.logger.log(`Payment failure notification sent for transaction ${payload.transactionId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment failure notification: ${error.message}`);
    }
  }
}