import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/notifications_db');
  const user = configService.get<string>('MONGODB_USER');
  const pass = configService.get<string>('MONGODB_PASS');

  const options: MongooseModuleOptions = {
    uri,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  };

  if (user && pass) {
    options.auth = { username: user, password: pass };
  }

  return options;
};