import { NestFactory } from '@nestjs/core';
import { ExportModule } from './export.module';
import * as bodyParser from 'body-parser';

export async function bootstrap() {
  const app = await NestFactory.create(ExportModule, {
    logger: ['error', 'log'],
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.setGlobalPrefix('/api');
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
