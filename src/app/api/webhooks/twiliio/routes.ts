import { NextRequest, NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { Channel } from '@/lib/integrations/types'
import prisma from '@/lib/db'

/**
 * POST handler for incoming Twilio webhooks (SMS/WhatsApp)
 * Processes inbound messages and stores them in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData()
    const body: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      body[key] = value.toString()
    })

    // Validate webhook signature for security
    const signature = request.headers.get('X-Twilio-Signature') || ''
    const url = request.url
    
    // Determine channel type from the 'From' field
    const from = body.From || ''
    const isWhatsApp = from.startsWith('whatsapp:')
    const channel: Channel = isWhatsApp ? 'WHATSAPP' : 'SMS'
    
    const integration = IntegrationFactory.getIntegration(channel)

    if (!integration) {
      console.error(`${channel} integration not configured`)
      return NextResponse.json(
        { error: `${channel} not configured` },
        { status: 500 }
      )
    }

    // Validate the webhook (comment out in development if having issues)
    // const isValid = integration.validateWebhook(signature, body, url)
    // if (!isValid) {
    //   console.error('Invalid Twilio webhook signature')
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Process the webhook and normalize the data
    const inboundMessage = await integration.processWebhook(body)

    if (!inboundMessage) {
      console.error('Failed to process Twilio webhook')
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      )
    }

    // Find or create contact
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
      // Create new contact
      contact = await prisma.contact.create({
        data: {
          name: inboundMessage.from,
          phone: isWhatsApp ? undefined : inboundMessage.from,
          whatsapp: isWhatsApp ? inboundMessage.from : undefined,
          lastContactedAt: new Date()
        }
      })
    } else {
      // Update last contacted timestamp
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastContactedAt: new Date() }
      })
    }

    // Store the message in database
    const message = await prisma.message.create({
      data: {
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

    console.log('Inbound message stored:', message.id)

    // Update analytics
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

    // Return TwiML response (required by Twilio)
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
    console.error('Twilio webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}