import { Module } from '@nestjs/common';
import { ExportController } from './controllers/export.controller';
import { ExportService } from './services/export.service';
import { AuthModule } from './auth/auth.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthModule, TerminusModule],
  controllers: [ExportController, HealthController],
  providers: [ExportService],
})
export class ExportModule {}
