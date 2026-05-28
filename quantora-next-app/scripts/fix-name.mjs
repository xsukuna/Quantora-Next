import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'scarfaceatwork@gmail.com' },
  data: { name: 'Aditya Kaushik', badge: 'Platform Admin' }
})

console.log('✅ scarfaceatwork@gmail.com → name: Aditya Kaushik, badge: Platform Admin')
await prisma.$disconnect()
