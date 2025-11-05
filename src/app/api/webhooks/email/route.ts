// src/app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Webhook] Received email webhook:', body)

    const integration = IntegrationFactory.getIntegration('EMAIL')
    if (!integration) {
      return NextResponse.json({ error: 'Email integration not configured' }, { status: 500 })
    }

    const inboundMessage = await integration.processWebhook(body)
    if (!inboundMessage) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: { email: inboundMessage.from }
    })

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: inboundMessage.from,
          email: inboundMessage.from,
          lastContactedAt: new Date()
        }
      })
    }

    // Find or create thread
    let thread = await prisma.thread.findFirst({
      where: { contactId: contact.id }
    })

    if (!thread) {
      thread = await prisma.thread.create({
        data: {
          contactId: contact.id,
          lastActivity: new Date()
        }
      })
    }

    // Create message
    await prisma.message.create({
      data: {
        threadId: thread.id,
        externalId: inboundMessage.externalId,
        contactId: contact.id,
        channel: 'EMAIL',
        direction: 'INBOUND',
        status: 'DELIVERED',
        content: inboundMessage.content,
        metadata: inboundMessage.metadata,
        sentAt: inboundMessage.timestamp,
        deliveredAt: inboundMessage.timestamp
      }
    })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.analytics.upsert({
      where: {
        date_channel: { date: today, channel: 'EMAIL' }
      },
      update: {
        messagesReceived: { increment: 1 }
      },
      create: {
        date: today,
        channel: 'EMAIL',
        messagesReceived: 1
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}