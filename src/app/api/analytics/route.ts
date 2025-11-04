import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/analytics?days=7&channel=SMS
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const days = Number(url.searchParams.get('days') || 7)
    const channel = url.searchParams.get('channel')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const where: any = {
      date: {
        gte: startDate,
      },
    }

    if (channel) {
      where.channel = channel
    }

    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    })

    // Calculate totals
    const totals = analytics.reduce(
      (acc, record) => ({
        messagesSent: acc.messagesSent + record.messagesSent,
        messagesReceived: acc.messagesReceived + record.messagesReceived,
        messagesFailed: acc.messagesFailed + record.messagesFailed,
        uniqueContacts: Math.max(acc.uniqueContacts, record.uniqueContacts),
        conversions: acc.conversions + record.conversions,
      }),
      {
        messagesSent: 0,
        messagesReceived: 0,
        messagesFailed: 0,
        uniqueContacts: 0,
        conversions: 0,
      }
    )

    // Calculate average response time
    const avgResponseTime =
      analytics.length > 0
        ? analytics.reduce((sum, record) => sum + record.avgResponseTime, 0) / analytics.length
        : 0

    return NextResponse.json({
      data: analytics,
      totals: {
        ...totals,
        avgResponseTime: Math.round(avgResponseTime),
      },
      period: {
        start: startDate,
        end: new Date(),
        days,
      },
    })
  } catch (error) {
    console.error('[API] Get analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}