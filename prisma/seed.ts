import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@unified-inbox.local' },
    update: {},
    create: {
      email: 'demo@unified-inbox.local',
      name: 'Demo User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Created user:', user.email)

  // Create demo team
  const team = await prisma.team.upsert({
    where: { slug: 'demo-team' },
    update: {},
    create: {
      name: 'Demo Team',
      slug: 'demo-team'
    }
  })

  console.log('✅ Created team:', team.name)

  // Update user with team
  await prisma.user.update({
    where: { id: user.id },
    data: { teamId: team.id }
  })

  // Create demo contacts - USE ID INSTEAD OF EMAIL
  const contactIds = ['contact-alice', 'contact-bob', 'contact-carol']
  
  const contacts = [
    {
      id: contactIds[0],
      name: 'Alice Johnson',
      phone: '+919999000001',
      email: 'alice@example.com',
      tags: ['customer', 'vip']
    },
    {
      id: contactIds[1],
      name: 'Bob Smith',
      phone: '+919999000002',
      whatsapp: '+919999000002',
      email: 'bob@example.com',
      tags: ['lead']
    },
    {
      id: contactIds[2],
      name: 'Carol Williams',
      phone: '+919999000003',
      email: 'carol@example.com',
      tags: ['customer']
    }
  ]

  for (let i = 0; i < contacts.length; i++) {
    const contactData = contacts[i]
    
    const contact = await prisma.contact.upsert({
      where: { id: contactData.id }, // Use ID instead of email
      update: {},
      create: {
        ...contactData,
        lastContactedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    })

    console.log('✅ Created contact:', contact.name)

    // Create thread
    const thread = await prisma.thread.upsert({
      where: { id: `thread-${contact.id}` },
      update: {},
      create: {
        id: `thread-${contact.id}`,
        contactId: contact.id,
        lastActivity: new Date()
      }
    })

    // Create sample messages
    const messages = [
      {
        threadId: thread.id,
        contactId: contact.id,
        channel: 'SMS',
        direction: 'INBOUND',
        status: 'DELIVERED',
        content: 'Hi, I need help with my order',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        threadId: thread.id,
        contactId: contact.id,
        channel: 'SMS',
        direction: 'OUTBOUND',
        status: 'DELIVERED',
        content: 'Hello! I\'d be happy to help. Can you provide your order number?',
        sentAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      }
    ]

    await prisma.message.createMany({
      data: messages as any
    })

    // Create note
    await prisma.note.create({
      data: {
        contactId: contact.id,
        authorId: user.id,
        content: `Initial conversation with ${contact.name}. Seems interested in our services.`,
        isPrivate: false
      }
    })
  }

  // Create analytics data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const channels = ['SMS', 'WHATSAPP'] as const

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    for (const channel of channels) {
      await prisma.analytics.upsert({
        where: {
          date_channel: { date, channel }
        },
        update: {},
        create: {
          date,
          channel,
          messagesSent: Math.floor(Math.random() * 50) + 10,
          messagesReceived: Math.floor(Math.random() * 40) + 5,
          avgResponseTime: Math.random() * 300 + 60,
          uniqueContacts: Math.floor(Math.random() * 20) + 5,
          conversions: Math.floor(Math.random() * 5)
        }
      })
    }
  }

  console.log('✅ Created analytics data')
  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Email: demo@unified-inbox.local')
  console.log('  Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })