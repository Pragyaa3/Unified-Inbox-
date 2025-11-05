import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { IntegrationFactory } from '@/lib/integrations/factory'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const contactId = url.searchParams.get('contactId')
  const limit = Number(url.searchParams.get('limit') || 100)

  if (!contactId) {
    return NextResponse.json({ data: [] })
  }

  try {
    const messages = await prisma.message.findMany({
      where: { contactId },
      orderBy: { createdAt: 'asc' },
      take: limit
    })

    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('[API] Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactId, channel, content, mediaUrls, scheduledFor } = body

    if (!contactId || !channel || !content) {
      return NextResponse.json(
        { error: 'contactId, channel, and content are required' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
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

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      
      const message = await prisma.message.create({
        data: {
          threadId: thread.id,
          contactId: contact.id,
          channel,
          direction: 'OUTBOUND',
          status: 'SCHEDULED',
          content,
          mediaUrls: mediaUrls || [],
          scheduledFor: scheduledDate
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Message scheduled',
        data: message
      })
    }

    const integration = IntegrationFactory.getIntegration(channel)
    
    if (!integration || !integration.isConfigured()) {
      const message = await prisma.message.create({
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

      return NextResponse.json({
        success: true,
        message: 'Message stored as pending',
        data: message
      })
    }

    const to = channel === 'WHATSAPP' 
      ? (contact.whatsapp || contact.phone || '')
      : (contact.phone || contact.email || '')

    if (!to) {
      return NextResponse.json(
        { error: `Contact missing ${channel} information` },
        { status: 400 }
      )
    }

    const sendResult = await integration.send({
      to,
      content,
      mediaUrls: mediaUrls || []
    })

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
        sentAt: new Date(),
        errorMessage: sendResult.error
      }
    })

    await prisma.thread.update({
      where: { id: thread.id },
      data: { lastActivity: new Date() }
    })

    await prisma.contact.update({
      where: { id: contact.id },
      data: { lastContactedAt: new Date() }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.analytics.upsert({
      where: {
        date_channel: { date: today, channel: channel as any }
      },
      update: {
        messagesSent: { increment: 1 }
      },
      create: {
        date: today,
        channel: channel as any,
        messagesSent: 1
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      data: message
    })
  } catch (error) {
    console.error('[API] Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}