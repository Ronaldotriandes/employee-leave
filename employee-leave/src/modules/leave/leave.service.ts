import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma/src';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) { }

  async create(createLeaveDto: CreateLeaveDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createLeaveDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    await this.validateLeaveRules(createLeaveDto);

    const leave = await this.prisma.leave.create({
      data: {
        alasanCuti: createLeaveDto.alasanCuti,
        tanggalMulaiCuti: new Date(createLeaveDto.tanggalMulaiCuti),
        tanggalSelesaiCuti: new Date(createLeaveDto.tanggalSelesaiCuti),
        employeeId: createLeaveDto.employeeId,
      },
      include: {
        employee: true,
      },
    });

    return leave;
  }

  async findAll() {
    return this.prisma.leave.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    return leave;
  }

  async findByEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.leave.findMany({
      where: { employeeId },
      include: {
        employee: true,
      },
      orderBy: {
        tanggalMulaiCuti: 'desc',
      },
    });
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto) {
    const existingLeave = await this.findOne(id);

    if (
      updateLeaveDto.tanggalMulaiCuti ||
      updateLeaveDto.tanggalSelesaiCuti ||
      updateLeaveDto.employeeId
    ) {
      const validationDto = {
        ...existingLeave,
        ...updateLeaveDto,
        tanggalMulaiCuti:
          updateLeaveDto.tanggalMulaiCuti ||
          existingLeave.tanggalMulaiCuti.toISOString(),
        tanggalSelesaiCuti:
          updateLeaveDto.tanggalSelesaiCuti ||
          existingLeave.tanggalSelesaiCuti.toISOString(),
      };

      await this.validateLeaveRules(validationDto as CreateLeaveDto, id);
    }

    const updateData: any = {};
    if (updateLeaveDto.alasanCuti)
      updateData.alasanCuti = updateLeaveDto.alasanCuti;
    if (updateLeaveDto.tanggalMulaiCuti)
      updateData.tanggalMulaiCuti = new Date(updateLeaveDto.tanggalMulaiCuti);
    if (updateLeaveDto.tanggalSelesaiCuti)
      updateData.tanggalSelesaiCuti = new Date(
        updateLeaveDto.tanggalSelesaiCuti,
      );
    if (updateLeaveDto.employeeId)
      updateData.employeeId = updateLeaveDto.employeeId;

    return this.prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.leave.delete({
      where: { id },
    });

    return { message: 'Leave deleted successfully' };
  }

  async findEmployeesWithLeaves() {
    return this.prisma.employee.findMany({
      include: {
        leaves: {
          orderBy: {
            tanggalMulaiCuti: 'desc',
          },
        },
      },
    });
  }

  private async validateLeaveRules(
    leaveDto: CreateLeaveDto,
    excludeLeaveId?: string,
  ) {
    const tanggalMulaiCuti = new Date(leaveDto.tanggalMulaiCuti);
    const tanggalSelesaiCuti = new Date(leaveDto.tanggalSelesaiCuti);

    if (tanggalSelesaiCuti < tanggalMulaiCuti) {
      throw new BadRequestException(
        'Tanggal selesai cuti harus setelah tanggal mulai cuti',
      );
    }

    const diffTime = Math.abs(
      tanggalSelesaiCuti.getTime() - tanggalMulaiCuti.getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const currentYear = tanggalMulaiCuti.getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const existingYearlyLeaves = await this.prisma.leave.findMany({
      where: {
        employeeId: leaveDto.employeeId,
        id: excludeLeaveId ? { not: excludeLeaveId } : undefined,
        OR: [
          {
            tanggalMulaiCuti: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
          {
            tanggalSelesaiCuti: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
        ],
      },
    });

    let totalYearlyDays = diffDays;
    for (const leave of existingYearlyLeaves) {
      const leaveDiffTime = Math.abs(
        leave.tanggalSelesaiCuti.getTime() - leave.tanggalMulaiCuti.getTime(),
      );
      const leaveDiffDays =
        Math.ceil(leaveDiffTime / (1000 * 60 * 60 * 24)) + 1;
      totalYearlyDays += leaveDiffDays;
    }

    if (totalYearlyDays > 12) {
      throw new BadRequestException(
        'Employee telah mencapai batas cuti tahunan (maksimal 12 hari per tahun)',
      );
    }

    const requestedMonth = tanggalMulaiCuti.getMonth();
    const requestedYear = tanggalMulaiCuti.getFullYear();
    const monthStart = new Date(requestedYear, requestedMonth, 1);
    const monthEnd = new Date(requestedYear, requestedMonth + 1, 0);

    const existingMonthlyLeaves = await this.prisma.leave.findMany({
      where: {
        employeeId: leaveDto.employeeId,
        id: excludeLeaveId ? { not: excludeLeaveId } : undefined,
        OR: [
          {
            tanggalMulaiCuti: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          {
            tanggalSelesaiCuti: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        ],
      },
    });

    let totalMonthlyDays = diffDays;
    for (const leave of existingMonthlyLeaves) {
      const leaveDiffTime = Math.abs(
        leave.tanggalSelesaiCuti.getTime() - leave.tanggalMulaiCuti.getTime(),
      );
      const leaveDiffDays =
        Math.ceil(leaveDiffTime / (1000 * 60 * 60 * 24)) + 1;
      totalMonthlyDays += leaveDiffDays;
    }

    if (totalMonthlyDays > 1) {
      throw new BadRequestException(
        'Employee telah mencapai batas cuti bulanan (maksimal 1 hari per bulan)',
      );
    }
  }
}
