import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Handlebars from 'handlebars';
import { NotificationTemplate, NotificationTemplateDocument } from '../entities/notification-template.schema';
import { CreateTemplateDto } from '../dto/notification.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private templateModel: Model<NotificationTemplateDocument>,
  ) {}

  async createTemplate(templateDto: CreateTemplateDto): Promise<NotificationTemplate> {
    const existingTemplate = await this.templateModel.findOne({ name: templateDto.name });
    if (existingTemplate) {
      throw new Error(`Template with name '${templateDto.name}' already exists`);
    }

    const template = new this.templateModel({
      ...templateDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return template.save();
  }

  async getTemplate(name: string): Promise<NotificationTemplate | null> {
    return this.templateModel.findOne({ name, isActive: true }).exec();
  }

  async getTemplates(type?: string): Promise<NotificationTemplate[]> {
    const query: any = { isActive: true };
    if (type) {
      query.type = type;
    }
    return this.templateModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateTemplate(name: string, templateDto: Partial<CreateTemplateDto>): Promise<NotificationTemplate> {
    const template = await this.templateModel.findOneAndUpdate(
      { name },
      { ...templateDto, updatedAt: new Date() },
      { new: true },
    );

    if (!template) {
      throw new NotFoundException(`Template '${name}' not found`);
    }

    return template;
  }

  async deleteTemplate(name: string): Promise<boolean> {
    const result = await this.templateModel.findOneAndUpdate(
      { name },
      { isActive: false, updatedAt: new Date() },
      { new: true },
    );

    return !!result;
  }

  processTemplate(template: string, data: Record<string, any>): string {
    try {
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      throw new Error(`Failed to process template: ${error.message}`);
    }
  }

  async seedDefaultTemplates() {
    const defaultTemplates = [
      {
        name: 'welcome_email',
        type: 'email',
        subject: 'Bienvenido a la Plataforma de Jiu Jitsu {{name}}',
        content: `
          <h1>¡Bienvenido {{name}}!</h1>
          <p>Te damos la bienvenida a nuestra plataforma de Jiu Jitsu.</p>
          <p>Ya puedes explorar eventos, competencias y nuestro marketplace.</p>
          <p>¡Oss!</p>
        `,
        variables: ['name'],
        description: 'Email de bienvenida para nuevos usuarios',
      },
      {
        name: 'event_reminder',
        type: 'email',
        subject: 'Recordatorio: {{eventName}} - {{eventDate}}',
        content: `
          <h2>Recordatorio de Evento</h2>
          <p>No olvides que tienes registrado el evento:</p>
          <h3>{{eventName}}</h3>
          <p><strong>Fecha:</strong> {{eventDate}}</p>
          <p><strong>Lugar:</strong> {{eventLocation}}</p>
          <p>¡Te esperamos!</p>
        `,
        variables: ['eventName', 'eventDate', 'eventLocation'],
        description: 'Recordatorio de eventos próximos',
      },
      {
        name: 'order_confirmation',
        type: 'email',
        subject: 'Confirmación de Pedido #{{orderNumber}}',
        content: `
          <h2>Confirmación de Pedido</h2>
          <p>Hemos recibido tu pedido #{{orderNumber}}</p>
          <p><strong>Total:</strong> $ {{total}}</p>
          <p>Te notificaremos cuando esté listo para envío.</p>
        `,
        variables: ['orderNumber', 'total'],
        description: 'Confirmación de pedidos en marketplace',
      },
    ];

    for (const template of defaultTemplates) {
      const exists = await this.templateModel.findOne({ name: template.name });
      if (!exists) {
        await this.templateModel.create(template);
      }
    }
  }
}