export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    namaDepan: string;
    namaBelakang: string;
    role: string;
  };
}
