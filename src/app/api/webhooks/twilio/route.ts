// src/app/api/webhooks/twilio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    console.log('[Webhook] Received Twilio webhook:', body)

    const from = body.From || ''
    const isWhatsApp = from.startsWith('whatsapp:')
    const channel = isWhatsApp ? 'WHATSAPP' : 'SMS'

    const integration = IntegrationFactory.getIntegration(channel)

    if (!integration) {
      console.error(`[Webhook] ${channel} integration not configured`)
      return NextResponse.json(
        { error: `${channel} not configured` },
        { status: 500 }
      )
    }

    const inboundMessage = await integration.processWebhook(body)

    if (!inboundMessage) {
      console.error('[Webhook] Failed to process webhook')
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      )
    }

    const normalizedPhone = inboundMessage.from.replace(/\D/g, '')
    
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { phone: { contains: normalizedPhone } },
          { whatsapp: { contains: normalizedPhone } }
        ]
      }
    })

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: inboundMessage.from,
          phone: isWhatsApp ? undefined : inboundMessage.from,
          whatsapp: isWhatsApp ? inboundMessage.from : undefined,
          lastContactedAt: new Date()
        }
      })
      console.log('[Webhook] Created new contact:', contact.id)
    } else {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastContactedAt: new Date() }
      })
    }

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

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        externalId: inboundMessage.externalId,
        contactId: contact.id,
        channel: inboundMessage.channel,
        direction: 'INBOUND',
        status: 'DELIVERED',
        content: inboundMessage.content,
        mediaUrls: inboundMessage.mediaUrls || [],
        metadata: inboundMessage.metadata,
        sentAt: inboundMessage.timestamp,
        deliveredAt: inboundMessage.timestamp
      }
    })

    console.log('[Webhook] Message stored:', message.id)

    await prisma.thread.update({
      where: { id: thread.id },
      data: { lastActivity: new Date() }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.analytics.upsert({
      where: {
        date_channel: {
          date: today,
          channel: inboundMessage.channel
        }
      },
      update: {
        messagesReceived: { increment: 1 }
      },
      create: {
        date: today,
        channel: inboundMessage.channel,
        messagesReceived: 1
      }
    })

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml'
        }
      }
    )
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}