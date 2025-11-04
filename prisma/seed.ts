import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const user = await prisma.user.upsert({
    where: { email: 'demo@local' },
    update: { name: 'Demo User' },
    create: {
      email: 'demo@local',
      name: 'Demo User',
      role: 'ADMIN'
    }
  })

  const contact = await prisma.contact.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      phone: '+919999000001',
      email: 'alice@example.com',
      lastContactedAt: new Date()
    }
  })

  

  await prisma.message.createMany({
    data: [
      {
        contactId: contact.id,
        channel: 'SMS',
        direction: 'INBOUND',
        status: 'DELIVERED',
        content: 'Hi, is this the support line?',
        sentAt: new Date(),
        deliveredAt: new Date()
      },
      {
        contactId: contact.id,
        channel: 'SMS',
        direction: 'OUTBOUND',
        status: 'SENT',
        content: 'Yes — how can we help?',
        sentAt: new Date(),
        deliveredAt: new Date()
      }
    ]
  })

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
