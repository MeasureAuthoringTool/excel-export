import {
  Body,
  Controller,
  Header,
  Logger,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { UserExportService } from '../services/user-export.service';
import { GenerateUserExportDto } from '../dto/GenerateUserExportDto';
import { USER_EXPORT_DEFAULT_FILENAME } from '../services/static/UserExportColumns';

@Controller('excel')
@UseGuards(AuthGuard)
export class UserExportController {
  private readonly logger = new Logger(UserExportController.name);

  constructor(private readonly userExportService: UserExportService) {}

  @Post('/user-export')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    `attachment; filename="${USER_EXPORT_DEFAULT_FILENAME}"`,
  )
  async getUserExportFile(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    generateUserExportDto: GenerateUserExportDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating Full User Export for ${
        generateUserExportDto?.rows?.length ?? 0
      } row(s)`,
    );
    const buffer = await this.userExportService.generateUserExportXlsx(
      generateUserExportDto,
    );
    res.send(buffer);
  }
}
