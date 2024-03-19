import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ExportModule } from '../src/export.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ExportModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/excel')
      .set(
        'authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.kcPmFlSUdC9LvuMufomQepInu3GwbBKKct49e2dxyrI',
      )
      .expect(200)
      .expect(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
  });

  it('/ (GET) unauthorized', () => {
    return request(app.getHttpServer()).get('/excel').expect(401).expect({
      message: 'Token not present',
      error: 'Unauthorized',
      statusCode: 401,
    });
  });
});
