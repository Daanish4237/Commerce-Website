import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sohojewels.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@sohojewels.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Admin user created:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
