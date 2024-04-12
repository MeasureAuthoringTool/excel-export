import { NestFactory } from '@nestjs/core';
import { ExportModule } from './export.module';

export async function bootstrap() {
  const app = await NestFactory.create(ExportModule, {
    logger: ['error', 'log'],
  });
  app.enableCors({
    origin: [
      'http://localhost:9000',
      'https://dev-madie.hcqis.org',
      'https://test-madie.hcqis.org',
      'https://impl-madie.hcqis.org',
      'https://madie.cms.gov',
    ],
    methods: ['GET', 'PUT'],
  });
  await app.listen(3000);
}
bootstrap();
