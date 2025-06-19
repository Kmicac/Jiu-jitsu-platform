import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationTemplate, NotificationTemplateDocument } from '../../entities/notification-template.schema';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private templateModel: Model<NotificationTemplateDocument>,
  ) {}

  async findAll() {
    return this.templateModel.find().exec();
  }

  async findById(templateId: string) {
    return this.templateModel.findOne({ templateId }).exec();
  }

  async create(template: Partial<NotificationTemplate>) {
    const newTemplate = new this.templateModel(template);
    return newTemplate.save();
  }

  async update(templateId: string, template: Partial<NotificationTemplate>) {
    return this.templateModel
      .findOneAndUpdate({ templateId }, template, { new: true })
      .exec();
  }

  async delete(templateId: string) {
    return this.templateModel.findOneAndDelete({ templateId }).exec();
  }
}