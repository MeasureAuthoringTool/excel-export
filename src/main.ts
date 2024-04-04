import { NestFactory } from '@nestjs/core';
import { ExportModule } from './export.module';

export async function bootstrap() {
  const app = await NestFactory.create(ExportModule, {
    logger: ['error', 'log'],
  });
  await app.listen(3000);
}
bootstrap();
