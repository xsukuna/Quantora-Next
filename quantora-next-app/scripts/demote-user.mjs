import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'angelbroking.of@gmail.com' },
  data: { role: 'CONTRIBUTOR' }
})

console.log('✅ angelbroking.of@gmail.com → CONTRIBUTOR')
await prisma.$disconnect()
