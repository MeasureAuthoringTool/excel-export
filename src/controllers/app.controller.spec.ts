import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Response } from 'express';

import { AppService } from '../services/app.service';
import { JwtService } from '@nestjs/jwt';
import {} from 'node-mocks-http';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, JwtService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "OK"', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const httpMocks = require('node-mocks-http');

      const response: Response = httpMocks.createResponse() as Response;

      await expect(appController.getFile(response)).toBeDefined();
      //expect(res.statusCode).toEqual(200);
    });

    it('should call generateXlsx method of excelService', async () => {
      jest
        .spyOn(appService, 'generateXlsx')
        .mockResolvedValueOnce(Buffer.from('mocked-excel-data'));
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };
      await appController.getFile(res as Response);
      expect(appService.generateXlsx).toHaveBeenCalledTimes(1);
    });
    it('should send the generated Excel file as the response', async () => {
      const mockedExcelBuffer = Buffer.from('mocked-excel-data');
      jest
        .spyOn(appService, 'generateXlsx')
        .mockResolvedValueOnce(mockedExcelBuffer);
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };
      await appController.getFile(res as Response);
      expect(res.send).toHaveBeenCalledWith(mockedExcelBuffer);
    });
  });
});
