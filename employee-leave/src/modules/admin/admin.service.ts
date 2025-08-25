import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'libs/prisma/src';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async create(createAdminDto: CreateAdminDto) {
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: createAdminDto.email },
        });

        if (existingAdmin) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

        return this.prisma.admin.create({
            data: {
                ...createAdminDto,
                password: hashedPassword,
                tanggalLahir: new Date(createAdminDto.tanggalLahir),
            },
            select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
                email: true,
                tanggalLahir: true,
                jenisKelamin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findAll() {
        return this.prisma.admin.findMany({
            select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
                email: true,
                tanggalLahir: true,
                jenisKelamin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findOne(id: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
                email: true,
                tanggalLahir: true,
                jenisKelamin: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        return admin;
    }

    async update(id: string, updateAdminDto: UpdateAdminDto) {
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { id },
        });

        if (!existingAdmin) {
            throw new NotFoundException('Admin not found');
        }

        if (updateAdminDto.email && updateAdminDto.email !== existingAdmin.email) {
            const emailExists = await this.prisma.admin.findUnique({
                where: { email: updateAdminDto.email },
            });

            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }

        const updateData: any = { ...updateAdminDto };

        if (updateAdminDto.password) {
            updateData.password = await bcrypt.hash(updateAdminDto.password, 10);
        }

        if (updateAdminDto.tanggalLahir) {
            updateData.tanggalLahir = new Date(updateAdminDto.tanggalLahir);
        }

        return this.prisma.admin.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
                email: true,
                tanggalLahir: true,
                jenisKelamin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async remove(id: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
        });

        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        return this.prisma.admin.delete({
            where: { id },
            select: {
                id: true,
                namaDepan: true,
                namaBelakang: true,
                email: true,
            },
        });
    }

    async login(loginAdminDto: LoginAdminDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: loginAdminDto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginAdminDto.password,
            admin.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: admin.id,
            email: admin.email,
            role: 'ADMIN'
        };
        return {
            access_token: this.jwtService.sign(payload),
            admin: {
                id: admin.id,
                namaDepan: admin.namaDepan,
                namaBelakang: admin.namaBelakang,
                email: admin.email,
                tanggalLahir: admin.tanggalLahir,
                jenisKelamin: admin.jenisKelamin,
                role: 'ADMIN'
            },
        };
    }

    async findByEmail(email: string) {
        return this.prisma.admin.findUnique({
            where: { email },
        });
    }

    async updateProfile(id: string, updateAdminDto: UpdateAdminDto) {
        return this.update(id, updateAdminDto);
    }
}
