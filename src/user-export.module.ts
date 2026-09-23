import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserExportController } from './controllers/user-export.controller';
import { UserExportService } from './services/user-export.service';

@Module({
  imports: [AuthModule],
  controllers: [UserExportController],
  providers: [UserExportService],
})
export class UserExportModule {}
