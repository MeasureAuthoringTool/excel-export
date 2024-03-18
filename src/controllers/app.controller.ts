import { Controller, Get, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from '../services/app.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Get()
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="exampleWorkbook.xlsx"')
  async getFile(@Res() res: Response) {
    const buffer = await this.appService.generateXlsx();
    res.send(buffer);
  }
}
