import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Get()
  getFile(@Res() res: Response): any {
    const wb: any = this.appService.getExport();
    wb.write(`FileName.xlsx`, res);
    return res;
  }
}
