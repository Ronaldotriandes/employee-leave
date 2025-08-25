import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmployee) {
      throw new ConflictException('Email already exists');
    }

    return this.prisma.employee.create({
      data: createEmployeeDto,
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
        noHp: true,
        alamat: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
        noHp: true,
        alamat: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
        noHp: true,
        alamat: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findOneWithLeaves(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
        noHp: true,
        alamat: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
        leaves: {
          select: {
            id: true,
            alasanCuti: true,
            tanggalMulaiCuti: true,
            tanggalSelesaiCuti: true,
            employeeId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== existingEmployee.email) {
      const emailExists = await this.prisma.employee.findUnique({
        where: { email: updateEmployeeDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
        noHp: true,
        alamat: true,
        jenisKelamin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employee.delete({
      where: { id },
      select: {
        id: true,
        namaDepan: true,
        namaBelakang: true,
        email: true,
      },
    });
  }
}
