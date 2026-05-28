import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Promote all accounts belonging to the owner to ADMIN
const result = await prisma.user.updateMany({
  where: {
    email: { in: ['scarfaceatwork@gmail.com', 'angelbroking.of@gmail.com'] }
  },
  data: { role: 'ADMIN' }
})

console.log(`\n✅ Promoted ${result.count} account(s) to ADMIN`)

// Verify
const admins = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  select: { email: true, username: true, name: true, role: true }
})

console.log('\n=== ADMIN USERS ===')
admins.forEach(u => console.log(`  ✦ ${u.name} | ${u.email} | @${u.username}`))

await prisma.$disconnect()
