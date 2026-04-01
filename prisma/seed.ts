import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('JeepO59582@', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'sohomarketingnet@gmail.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Soho Jewels',
      email: 'sohomarketingnet@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
