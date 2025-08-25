import { Module } from '@nestjs/common';
import { PrismaModule } from 'libs/prisma/src';
import { AuthModule } from '../auth/auth.module';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { ValidateDateRange } from './validators/date-range.validator';
import { ValidateLeaveLimit } from './validators/leave-limit.validator';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LeaveController],
  providers: [LeaveService, ValidateDateRange, ValidateLeaveLimit],
  exports: [LeaveService],
})
export class LeaveModule {}
