import { Module } from '@nestjs/common';
import { ExportController } from './controllers/export.controller';
import { ExportService } from './services/export.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
