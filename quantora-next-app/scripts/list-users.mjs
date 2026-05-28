import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const users = await prisma.user.findMany({
  select: { id: true, email: true, username: true, name: true, role: true, clerkId: true }
})

console.log('\n=== ALL USERS ===')
users.forEach((u, i) => {
  console.log(`${i+1}. ${u.name} | ${u.email} | @${u.username} | role=${u.role} | clerkId=${u.clerkId || 'none'}`)
})
console.log(`\nTotal: ${users.length} users`)

await prisma.$disconnect()
