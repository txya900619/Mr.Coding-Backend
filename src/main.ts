import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv/types';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.ProductionPort || 3000);
}
bootstrap();
