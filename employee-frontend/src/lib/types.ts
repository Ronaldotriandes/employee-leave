export type Gender = 'MALE' | 'FEMALE';

export interface Admin {
  id: string;
  namaDepan: string;
  namaBelakang: string;
  email: string;
  tanggalLahir: string;
  jenisKelamin: Gender;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  namaDepan: string;
  namaBelakang: string;
  email: string;
  noHp: string;
  alamat: string;
  jenisKelamin: Gender;
  createdAt: string;
  updatedAt: string;
  leaves?: Leave[];
  role: string;
  tanggalLahir: string;
}

export interface Leave {
  id: string;
  alasanCuti: string;
  tanggalMulaiCuti: string;
  tanggalSelesaiCuti: string;
  employeeId: string;
  employee?: Employee;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  admin: Admin;
}
