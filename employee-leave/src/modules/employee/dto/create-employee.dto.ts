import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  namaDepan: string;

  @IsString()
  @IsNotEmpty()
  namaBelakang: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  noHp: string;

  @IsString()
  @IsNotEmpty()
  alamat: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  jenisKelamin: Gender;
}
