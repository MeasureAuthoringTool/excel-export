import { Controller, Get, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from '../services/export.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('excel')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @UseGuards(AuthGuard)
  @Get()
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="exampleWorkbook.xlsx"')
  async getFile(@Res() res: Response) {
    const buffer = await this.exportService.generateXlsx();
    res.send(buffer);
  }
}
