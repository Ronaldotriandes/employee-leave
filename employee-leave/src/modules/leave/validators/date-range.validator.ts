import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateDateRange', async: false })
export class ValidateDateRange implements ValidatorConstraintInterface {
  validate(tanggalSelesaiCuti: string, args: ValidationArguments): boolean {
    const object = args.object as any;
    const tanggalMulaiCuti = object.tanggalMulaiCuti;

    if (!tanggalMulaiCuti || !tanggalSelesaiCuti) {
      return false;
    }

    const startDate = new Date(tanggalMulaiCuti);
    const endDate = new Date(tanggalSelesaiCuti);
    return endDate >= startDate;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Tanggal selesai cuti harus setelah tanggal mulai cuti';
  }
}
