import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from 'libs/prisma/src';

@ValidatorConstraint({ name: 'ValidateLeaveLimit', async: true })
@Injectable()
export class ValidateLeaveLimit implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {
    console.log('ValidateLeaveLimit constructor, prisma:', !!this.prisma);
  }

  async validate(
    employeeId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const object = args.object as any;
    const tanggalMulaiCuti = new Date(object.tanggalMulaiCuti);
    const tanggalSelesaiCuti = new Date(object.tanggalSelesaiCuti);

    if (!tanggalMulaiCuti || !tanggalSelesaiCuti) {
      return false;
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
        employeeId,
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
      return false;
    }

    const requestedMonth = tanggalMulaiCuti.getMonth();
    const requestedYear = tanggalMulaiCuti.getFullYear();
    const monthStart = new Date(requestedYear, requestedMonth, 1);
    const monthEnd = new Date(requestedYear, requestedMonth + 1, 0);

    const existingMonthlyLeaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
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

    return totalMonthlyDays <= 1;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Employee telah mencapai batas cuti (maksimal 12 hari per tahun atau 1 hari per bulan)';
  }
}
