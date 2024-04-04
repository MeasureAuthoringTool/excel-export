import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { Response, Request } from 'express';

import { ExportService } from '../services/export.service';
import { JwtService } from '@nestjs/jwt';
import {} from 'node-mocks-http';
import { TestCaseExcelExportDto } from '@madie/madie-models';

describe('exportController', () => {
  let exportController: ExportController;
  let exportService: ExportService;
  const exportDto: TestCaseExcelExportDto = {
    groupId: 'testGroupId',
    groupNumber: '1',
    testCaseExecutionResults: [
      {
        testCaseId: 'testCaseId',
        populations: [],
        notes: '',
        last: 'testSeries1',
        first: 'testTitle1',
        birthdate: '',
        expired: '',
        deathdate: '',
        ethnicity: null,
        race: null,
        gender: null,
        definitions: [],
        functions: [],
      },
    ],
  };
  let exportDtos: TestCaseExcelExportDto[];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [ExportService, JwtService],
    }).compile();

    exportController = app.get<ExportController>(ExportController);
    exportService = app.get<ExportService>(ExportService);

    exportDtos = [];
    exportDtos.push(exportDto);
  });

  describe('root', () => {
    it('should call generateXlsx method of excelService', async () => {
      jest
        .spyOn(exportService, 'generateXlsx')
        .mockResolvedValueOnce(Buffer.from('mocked-excel-data'));
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };

      const request: Request = { body: exportDtos } as Request;
      await exportController.getExcelFile(request, res as Response);
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
      const request: Request = { body: exportDtos } as Request;
      await exportController.getExcelFile(request, res as Response);
      expect(res.send).toHaveBeenCalledWith(mockedExcelBuffer);
    });
  });
});
