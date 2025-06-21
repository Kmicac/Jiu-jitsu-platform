import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KafkaAdminService } from './events/kafka/kafka.admin.service';

async function bootstrap() {
  // Crea una aplicación "headless", sin escuchar en ningún puerto
  const app = await NestFactory.createApplicationContext(AppModule);
  const kafkaAdminService = app.get(KafkaAdminService);

  console.log('Starting topic creation...');
  await kafkaAdminService.createTopics();
  console.log('Topic creation process finished.');

  await app.close();
  process.exit(0);
}

bootstrap().catch(err => {
  console.error('Error during topic creation:', err);
  process.exit(1);
});