import { Module } from '@nestjs/common';
import { ExportController } from './controllers/export.controller';
import { ExportService } from './services/export.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [AuthModule],
  controllers: [ExportController, HealthController],
  providers: [ExportService],
})
export class ExportModule {}
