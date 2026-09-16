import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserExportController } from './user-export.controller';
import { UserExportService } from '../services/user-export.service';
import { GenerateUserExportDto } from '../dto/GenerateUserExportDto';

describe('UserExportController', () => {
  let controller: UserExportController;
  let service: UserExportService;

  const mockResponse = (): Partial<Response> => ({
    send: jest.fn(),
    header: jest.fn(),
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserExportController],
      providers: [UserExportService, JwtService],
    }).compile();

    controller = app.get<UserExportController>(UserExportController);
    service = app.get<UserExportService>(UserExportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls the service and sends the generated workbook (empty rows)', async () => {
    const buffer = Buffer.from('mocked-xlsx-data');
    const generateSpy = jest
      .spyOn(service, 'generateUserExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto: GenerateUserExportDto = { rows: [] };

    await controller.getUserExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledTimes(1);
    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('sends the workbook when rows are provided', async () => {
    const buffer = Buffer.from('mocked-xlsx-with-rows');
    const generateSpy = jest
      .spyOn(service, 'generateUserExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto: GenerateUserExportDto = {
      rows: [{ firstName: 'Jane' }, { firstName: 'John' }],
    };

    await controller.getUserExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('handles a payload without a rows property', async () => {
    const buffer = Buffer.from('mocked-xlsx-data');
    const generateSpy = jest
      .spyOn(service, 'generateUserExportXlsx')
      .mockResolvedValueOnce(buffer);
    const res = mockResponse();
    const dto = {} as GenerateUserExportDto;

    await controller.getUserExportFile(dto, res as Response);

    expect(generateSpy).toHaveBeenCalledWith(dto);
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('propagates errors from the service', async () => {
    jest
      .spyOn(service, 'generateUserExportXlsx')
      .mockRejectedValueOnce(new Error('generation failed'));
    const res = mockResponse();

    await expect(
      controller.getUserExportFile({ rows: [] }, res as Response),
    ).rejects.toThrow('generation failed');
    expect(res.send).not.toHaveBeenCalled();
  });
});
