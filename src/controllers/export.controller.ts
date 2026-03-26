import {
  Controller,
  UseGuards,
  Res,
  Header,
  Req,
  Put,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ExportService } from '../services/export.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  TestCaseExcelExportDto,
  OverlappingCodeDto,
} from '@madie/madie-models';
import { MeasureAccessReportDTO } from '../dto/MeasureAccessReportDTO';
import { LibraryAccessReportDTO } from '../dto/LibraryAccessReportDTO';

@Controller('excel')
@UseGuards(AuthGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Put()
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="exampleWorkBook.xlsx"')
  async getExcelFile(@Req() req: Request, @Res() res: Response) {
    const testCaseGroupDtos: TestCaseExcelExportDto[] =
      req.body.testCaseExcelExportDtos;
    this.logger.log('request -> ' + JSON.stringify(testCaseGroupDtos));
    const buffer = await this.exportService.generateXlsx(testCaseGroupDtos);
    res.send(buffer);
  }

  @Put('/overlapping-codes')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="overlappingCodes.xlsx"')
  async getOverlappingCodesExcelFile(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const overlappingCodeDtos: OverlappingCodeDto[] = req.body;
    this.logger.log('request -> ' + JSON.stringify(overlappingCodeDtos));
    const buffer =
      await this.exportService.generateOverlappingCodeXlsx(overlappingCodeDtos);
    res.send(buffer);
  }

  @Put('/measure-shared-access-report')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async getSharedAccessReportForMeasures(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const accessReportDTOS: MeasureAccessReportDTO[] = req.body;
    if (
      !accessReportDTOS ||
      !Array.isArray(accessReportDTOS) ||
      accessReportDTOS.length === 0
    ) {
      throw new BadRequestException(
        'No measures found to generate the measure shared access report.',
      );
    }
    const ids = accessReportDTOS.map((report) => report.id).join(', ');
    this.logger.log(`Generating the access report for measures: ${ids}`);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
    const filename = `MeasureSharingExport_${timestamp}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const buffer =
      await this.exportService.generateSharedAccessReportForMeasures(
        accessReportDTOS,
      );
    this.logger.log(
      `Access report generated successfully for measures: ${ids}`,
    );
    res.send(buffer);
  }

  @Put('/library-shared-access-report')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async getSharedAccessReportForLibraries(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const accessReportDTOS: LibraryAccessReportDTO[] = req.body;
    if (
      !accessReportDTOS ||
      !Array.isArray(accessReportDTOS) ||
      accessReportDTOS.length === 0
    ) {
      throw new BadRequestException(
        'No libraries found to generate the library shared access report.',
      );
    }
    const ids = accessReportDTOS.map((report) => report.id).join(', ');
    this.logger.log(`Generating the access report for libraries: ${ids}`);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
    const filename = `LibrarySharingExport_${timestamp}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const buffer =
      await this.exportService.generateSharedAccessReportForLibraries(
        accessReportDTOS,
      );
    this.logger.log(
      `Access report generated successfully for libraries: ${ids}`,
    );
    res.send(buffer);
  }
}
