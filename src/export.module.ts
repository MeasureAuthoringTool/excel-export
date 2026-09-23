import { Module } from '@nestjs/common';
import { ExportController } from './controllers/export.controller';
import { ExportService } from './services/export.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './controllers/health.controller';
import { UserExportController } from './controllers/user-export.controller';
import { UserExportService } from './services/user-export.service';
import { CodeSystemExportController } from './controllers/code-system-export.controller';
import { CodeSystemExportService } from './services/code-system-export.service';

@Module({
  imports: [AuthModule],
  controllers: [
    ExportController,
    HealthController,
    UserExportController,
    CodeSystemExportController,
  ],
  providers: [ExportService, UserExportService, CodeSystemExportService],
})
export class ExportModule {}
