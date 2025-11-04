import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { normalizePhone } from '@/lib/utils'

export async function GET(request: NextRequest) {
  // GET /api/messages?contactId=...&limit=100
  const url = new URL(request.url)
  const contactId = url.searchParams.get('contactId')
  const limit = Number(url.searchParams.get('limit') || 100)

  if (!contactId) return NextResponse.json({ data: [] })

  const messages = await prisma.message.findMany({
    where: { contactId },
    orderBy: { createdAt: 'asc' },
    take: limit
  })

  return NextResponse.json({ data: messages })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactId, channel, content, mediaUrls, scheduledFor } = body

    if (!contactId || !channel) {
      return NextResponse.json({ error: 'contactId & channel required' }, { status: 400 })
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId } })
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

    // create thread if missing
    let thread = await prisma.thread.findFirst({ where: { contactId: contact.id } })
    if (!thread) {
      thread = await prisma.thread.create({ data: { contactId: contact.id, lastActivity: new Date() } })
    }

    // If scheduling provided, create ScheduledMessage row (simple approach)
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      // For simplicity we store as Message with status 'SCHEDULED'; Or you can add a ScheduledMessage model
      const scheduled = await prisma.message.create({
        data: {
          threadId: thread.id,
          contactId: contact.id,
          channel,
          direction: 'OUTBOUND',
          status: 'SCHEDULED',
          content,
          mediaUrls: mediaUrls || [],
          metadata: { scheduledFor: scheduledDate.toISOString() }
        }
      })
      return NextResponse.json({ data: scheduled })
    }

    // Otherwise send now via integration
    const integration = IntegrationFactory.getIntegration(channel)
    if (!integration || !integration.isConfigured()) {
      // If integration missing, still persist message with status 'PENDING' and return success
      const pending = await prisma.message.create({
        data: {
          threadId: thread.id,
          contactId: contact.id,
          channel,
          direction: 'OUTBOUND',
          status: 'PENDING',
          content,
          mediaUrls: mediaUrls || []
        }
      })
      return NextResponse.json({ data: pending })
    }

    const to = (channel === 'WHATSAPP' && contact.whatsapp) ? contact.whatsapp : contact.phone || contact.email || ''
    const sendResult = await integration.send({ to, content, mediaUrls: mediaUrls || [] })
    const status = sendResult.success ? 'SENT' : 'FAILED'

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        contactId: contact.id,
        externalId: sendResult.sid,
        channel,
        direction: 'OUTBOUND',
        status,
        content,
        mediaUrls: mediaUrls || [],
        sentAt: new Date()
      }
    })

    // Update thread last activity
    await prisma.thread.update({ where: { id: thread.id }, data: { lastActivity: new Date() } })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.analytics.upsert({
      where: { date_channel: { date: today, channel } },
      update: { messagesSent: { increment: 1 } },
      create: { date: today, channel, messagesSent: 1 }
    })

    return NextResponse.json({ data: message })
  } catch (e) {
    console.error('Send message error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
