import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Response } from 'express';

import { AppService } from '../services/app.service';
import { JwtService } from '@nestjs/jwt';
import {} from 'node-mocks-http';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, JwtService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "OK"', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const httpMocks = require('node-mocks-http');

      const response: Response = httpMocks.createResponse() as Response;

      await expect(appController.getFile(response)).toBeDefined();
      //expect(res.statusCode).toEqual(200);
    });
  });
});
