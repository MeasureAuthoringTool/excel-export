import {
  Body,
  Controller,
  Header,
  Logger,
  Put,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CodeSystemExportService } from '../services/code-system-export.service';
import { GenerateCodeSystemExportDto } from '../dto/GenerateCodeSystemExportDto';
import { CODE_SYSTEM_EXPORT_DEFAULT_FILENAME } from '../services/static/CodeSystemExportColumns';

@Controller('excel')
@UseGuards(AuthGuard)
export class CodeSystemExportController {
  private readonly logger = new Logger(CodeSystemExportController.name);

  constructor(
    private readonly codeSystemExportService: CodeSystemExportService,
  ) {}

  @Put('/code-system-export')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    `attachment; filename="${CODE_SYSTEM_EXPORT_DEFAULT_FILENAME}"`,
  )
  async getCodeSystemExportFile(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    generateCodeSystemExportDto: GenerateCodeSystemExportDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating Code System Export for ${
        generateCodeSystemExportDto?.rows?.length ?? 0
      } row(s)`,
    );
    const buffer =
      await this.codeSystemExportService.generateCodeSystemExportXlsx(
        generateCodeSystemExportDto,
      );
    res.send(buffer);
  }
}
