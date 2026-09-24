import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CodeSystemExportController } from './code-system-export.controller';
import { CodeSystemExportService } from '../services/code-system-export.service';
import { GenerateCodeSystemExportDto } from '../dto/GenerateCodeSystemExportDto';

describe('CodeSystemExportController', () => {
  let controller: CodeSystemExportController;
  let service: CodeSystemExportService;

  const mockResponse = (): Partial<Response> => ({
    send: jest.fn(),
    header: jest.fn(),
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CodeSystemExportController],
      providers: [CodeSystemExportService, JwtService],
    }).compile();

    controller = app.get<CodeSystemExportController>(
      CodeSystemExportController,
    );
    service = app.get<CodeSystemExportService>(CodeSystemExportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls the service and sends the generated workbook (empty rows)', async () => {
    const buffer = Buffer.from('mocked-xlsx-data');
    const generateSpy = jest
      .spyOn(service, 'generateCodeSystemExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto: GenerateCodeSystemExportDto = { rows: [] };

    await controller.getCodeSystemExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('sends the workbook when rows are provided', async () => {
    const buffer = Buffer.from('mocked-xlsx-with-rows');
    const generateSpy = jest
      .spyOn(service, 'generateCodeSystemExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto: GenerateCodeSystemExportDto = {
      rows: [{ title: 'LOINC' }, { title: 'SNOMEDCT' }],
    };

    await controller.getCodeSystemExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('handles a payload without a rows property', async () => {
    const buffer = Buffer.from('mocked-xlsx-data');
    const generateSpy = jest
      .spyOn(service, 'generateCodeSystemExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto = {} as GenerateCodeSystemExportDto;

    await controller.getCodeSystemExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('propagates errors from the service', async () => {
    jest
      .spyOn(service, 'generateCodeSystemExportXlsx')
      .mockRejectedValueOnce(new Error('generation failed'));
    const res = mockResponse();

    await expect(
      controller.getCodeSystemExportFile({ rows: [] }, res as Response),
    ).rejects.toThrow('generation failed');
    expect(res.send).not.toHaveBeenCalled();
  });
});
