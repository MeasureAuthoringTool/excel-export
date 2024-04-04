import { NestFactory } from '@nestjs/core';
import { ExportModule } from './export.module';

export async function bootstrap() {
  const app = await NestFactory.create(ExportModule, {
    logger: ['error', 'log'],
  });
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
