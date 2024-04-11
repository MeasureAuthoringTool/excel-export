import { NestFactory } from '@nestjs/core';
import { ExportModule } from './export.module';

export async function bootstrap() {
  const app = await NestFactory.create(ExportModule, { cors: true });
  await app.listen(3000);
}
bootstrap();
