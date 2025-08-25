import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'libs/prisma/src';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

interface Admin {
  id: string;
  email: string;
  namaDepan: string;
  namaBelakang: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) { }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const admin = await this.validateUser(loginDto.email, loginDto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      id: admin.id,
      email: admin.email,
      namaDepan: admin.namaDepan,
      namaBelakang: admin.namaBelakang,
      sub: admin.id,
      role: 'ADMIN'
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        namaDepan: admin.namaDepan,
        namaBelakang: admin.namaBelakang,
        role: 'admin',
      },
    };
  }

  async validateUser(email: string, password: string): Promise<Admin | null> {
    try {
      const admin = await this.prismaService.admin.findFirst({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          namaDepan: true,
          namaBelakang: true,
          password: true,
        },
      });

      if (admin && (await bcrypt.compare(password, admin.password))) {
        return admin;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async validateUserById(id: string): Promise<Admin | null> {
    const admin = await this.prismaService.admin.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        namaDepan: true,
        namaBelakang: true,
        password: true,
      },
    });
    return admin;
  }
}
