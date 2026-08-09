import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExportModule } from './export.module';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ExportModule, {
    logger: ['error', 'log'],
  });
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '50mb' });
  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: [
      'http://localhost:9000',
      'https://dev-madie.hcqis.org',
      'https://test-madie.hcqis.org',
      'https://impl-madie.hcqis.org',
      'https://dev.madie.internal.cms.gov',
      'https://test.madie.internal.cms.gov',
      'https://impl.madie.internal.cms.gov',
      'https://madie.cms.gov',
    ],
    methods: ['GET', 'PUT'],
  });
  await app.listen(3000);
}
bootstrap();
