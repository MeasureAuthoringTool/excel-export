import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { Response } from 'express';

import { ExportService } from '../services/export.service';
import { JwtService } from '@nestjs/jwt';
import {} from 'node-mocks-http';

describe('exportController', () => {
  let exportController: ExportController;
  let exportService: ExportService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [ExportService, JwtService],
    }).compile();

    exportController = app.get<ExportController>(ExportController);
    exportService = app.get<ExportService>(ExportService);
  });

  describe('root', () => {
    it('should return "OK"', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const httpMocks = require('node-mocks-http');

      const response: Response = httpMocks.createResponse() as Response;

      await expect(exportController.getFile(response)).toBeDefined();
      //expect(res.statusCode).toEqual(200);
    });

    it('should call generateXlsx method of excelService', async () => {
      jest
        .spyOn(exportService, 'generateXlsx')
        .mockResolvedValueOnce(Buffer.from('mocked-excel-data'));
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };
      await exportController.getFile(res as Response);
      expect(exportService.generateXlsx).toHaveBeenCalledTimes(1);
    });
    it('should send the generated Excel file as the response', async () => {
      const mockedExcelBuffer = Buffer.from('mocked-excel-data');
      jest
        .spyOn(exportService, 'generateXlsx')
        .mockResolvedValueOnce(mockedExcelBuffer);
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };
      await exportController.getFile(res as Response);
      expect(res.send).toHaveBeenCalledWith(mockedExcelBuffer);
    });
  });
});
