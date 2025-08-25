import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidateDateRange } from '../validators/date-range.validator';
import { ValidateLeaveLimit } from '../validators/leave-limit.validator';

export class UpdateLeaveDto {
  @IsString()
  @IsOptional()
  alasanCuti?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  tanggalMulaiCuti?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => new Date(value).toISOString())
  @Validate(ValidateDateRange)
  tanggalSelesaiCuti?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  @Validate(ValidateLeaveLimit)
  employeeId?: string;
}
