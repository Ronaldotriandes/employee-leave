import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  namaDepan: string;

  @IsString()
  @IsNotEmpty()
  namaBelakang: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  @IsNotEmpty()
  tanggalLahir: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  jenisKelamin: Gender;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
