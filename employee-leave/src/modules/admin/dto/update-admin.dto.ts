import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  namaDepan?: string;

  @IsString()
  @IsOptional()
  namaBelakang?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  tanggalLahir?: string;

  @IsEnum(Gender)
  @IsOptional()
  jenisKelamin?: Gender;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
