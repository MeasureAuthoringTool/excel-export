import { Controller, UseGuards, Res, Header, Req, Put } from '@nestjs/common';
import { Response, Request } from 'express';
import { ExportService } from '../services/export.service';
import { AuthGuard } from '../auth/auth.guard';
import { TestCaseExcelExportDto } from '@madie/madie-models';
import { log } from 'console';

@Controller('excel')
@UseGuards(AuthGuard)
export class ExportController {
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
    log('request -> ' + JSON.stringify(testCaseGroupDtos));
    const buffer = await this.exportService.generateXlsx(testCaseGroupDtos);
    res.send(buffer);
  }
}
