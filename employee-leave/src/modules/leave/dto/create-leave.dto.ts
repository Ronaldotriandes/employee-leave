import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Validate
} from 'class-validator';
import { ValidateDateRange } from '../validators/date-range.validator';
import { ValidateLeaveLimit } from '../validators/leave-limit.validator';

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  alasanCuti: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  tanggalMulaiCuti: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  @Validate(ValidateDateRange)
  tanggalSelesaiCuti: string;

  @IsString()
  @IsNotEmpty()
  @Validate(ValidateLeaveLimit)
  employeeId: string;
}
