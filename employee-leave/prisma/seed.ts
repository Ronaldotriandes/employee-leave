import { PrismaClient, Gender } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.create({
    data: {
      namaDepan: 'Admin',
      namaBelakang: 'System',
      email: 'admin@example.com',
      tanggalLahir: new Date('1990-01-01'),
      jenisKelamin: Gender.MALE,
      password: hashedPassword,
    },
  })

  console.log('Admin created:', admin)

  // Create sample employees
  const employees = await prisma.employee.createMany({
    data: [
      {
        namaDepan: 'John',
        namaBelakang: 'Doe',
        email: 'john.doe@example.com',
        noHp: '08123456789',
        alamat: 'Jl. Contoh No. 1',
        jenisKelamin: Gender.MALE,
      },
      {
        namaDepan: 'Jane',
        namaBelakang: 'Smith',
        email: 'jane.smith@example.com',
        noHp: '08198765432',
        alamat: 'Jl. Contoh No. 2',
        jenisKelamin: Gender.FEMALE,
      },
    ],
  })

  console.log('Employees created:', employees)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
