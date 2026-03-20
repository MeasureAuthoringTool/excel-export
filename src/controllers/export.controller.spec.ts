import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { Response, Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { ExportService } from '../services/export.service';
import { JwtService } from '@nestjs/jwt';
import {} from 'node-mocks-http';
import {
  TestCaseExcelExportDto,
  OverlappingCodeDto,
} from '@madie/madie-models';
import { MeasureAccessReportDTO } from '../dto/MeasureAccessReportDTO';

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

  const overlappingCodeDtos: OverlappingCodeDto[] = [
    {
      code: '4525004',
      description: 'Emergency department patient visit (procedure)',
      codeSystem: 'http://snomed.info/sct',
      codeSystemVersion: 'http://snomed.info/sct/731000124108/version/20250301',
      codeSystemName: 'http://snomed.info/sct',
      valueSets: [
        {
          name: 'EmergencyDepartmentEvaluationAndManagementVisit',
          oid: '2.16.840.1.113883.3.464.1003.101.12.1010',
          url: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.101.12.1010',
        },
        {
          name: 'EmergencyDepartmentVisit',
          oid: '2.16.840.1.113883.3.117.1.7.1.292',
          url: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.117.1.7.1.292',
        },
      ],
    },
  ];

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

    it('should call generateOverlappingCodeXlsx method of excelService', async () => {
      jest
        .spyOn(exportService, 'generateOverlappingCodeXlsx')
        .mockResolvedValueOnce(Buffer.from('mocked-excel-data'));
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };

      const request: Request = { body: overlappingCodeDtos } as Request;
      await exportController.getOverlappingCodesExcelFile(
        request,
        res as Response,
      );
      expect(exportService.generateOverlappingCodeXlsx).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should send the generated Overlapping Codes Excel file as the response', async () => {
      const mockedExcelBuffer = Buffer.from('mocked-excel-data');
      jest
        .spyOn(exportService, 'generateOverlappingCodeXlsx')
        .mockResolvedValueOnce(mockedExcelBuffer);
      const res: Partial<Response> = {
        header: jest.fn(),
        send: jest.fn(),
      };
      const request: Request = { body: overlappingCodeDtos } as Request;
      await exportController.getOverlappingCodesExcelFile(
        request,
        res as Response,
      );
      expect(res.send).toHaveBeenCalledWith(mockedExcelBuffer);
    });
  });

  describe('getSharedAccessReportForMeasures', () => {
    const accessReportDTOS: MeasureAccessReportDTO[] = [
      {
        id: 'measure-id-1',
        measureName: 'Test Measure One',
        measureModel: 'QI-Core v4.1.1',
        cmsId: 'CMS001',
        owner: 'owner1',
        sharedWith: [
          { userId: 'user1', dateShared: '2026-01-15' },
          { userId: 'user2', dateShared: '2026-02-20' },
        ],
      },
      {
        id: 'measure-id-2',
        measureName: 'Test Measure Two',
        measureModel: 'QDM v5.6',
        cmsId: 'CMS002',
        owner: 'owner2',
        sharedWith: [{ userId: 'user3', dateShared: '2026-03-01' }],
      },
    ];

    let res: Partial<Response>;
    beforeEach(() => {
      res = { send: jest.fn(), setHeader: jest.fn() };
    });

    it('should send the buffer returned by the service as the response', async () => {
      const mockedBuffer = Buffer.from('mocked-report');
      jest
        .spyOn(exportService, 'generateSharedAccessReportForMeasures')
        .mockResolvedValueOnce(mockedBuffer);
      const request: Request = { body: accessReportDTOS } as Request;

      await exportController.getSharedAccessReportForMeasures(
        request,
        res as Response,
      );

      expect(res.send).toHaveBeenCalledWith(mockedBuffer);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(
          /^attachment; filename="MeasureSharingExport_\d{14}\.xlsx"$/,
        ),
      );
    });

    it('should set Content-Disposition header with a timestamped filename', async () => {
      jest
        .spyOn(exportService, 'generateSharedAccessReportForMeasures')
        .mockResolvedValueOnce(Buffer.from('mocked-report'));
      const request: Request = { body: accessReportDTOS } as Request;

      await exportController.getSharedAccessReportForMeasures(
        request,
        res as Response,
      );

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(
          /^attachment; filename="MeasureSharingExport_\d{14}\.xlsx"$/,
        ),
      );
    });

    it('should throw BadRequestException when body is null', async () => {
      const request: Request = { body: null } as Request;

      await expect(
        exportController.getSharedAccessReportForMeasures(
          request,
          res as Response,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when body is undefined', async () => {
      const request: Request = { body: undefined } as Request;

      await expect(
        exportController.getSharedAccessReportForMeasures(
          request,
          res as Response,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when body is not an array', async () => {
      const request: Request = { body: { id: 'not-an-array' } } as Request;

      await expect(
        exportController.getSharedAccessReportForMeasures(
          request,
          res as Response,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with descriptive message when body is an empty array', async () => {
      const request: Request = { body: [] } as Request;

      await expect(
        exportController.getSharedAccessReportForMeasures(
          request,
          res as Response,
        ),
      ).rejects.toThrow(
        'No measures found to generate the measure shared access report.',
      );
    });
  });
});
