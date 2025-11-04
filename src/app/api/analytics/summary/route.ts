// import { NextRequest, NextResponse } from 'next/server'
// import prisma from '@/lib/db'

// export async function GET() {
//   // simple aggregated stats
//   try {
//     const totalMessages = await prisma.message.count()
//     const totalContacts = await prisma.contact.count()
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
//     const todayMessages = await prisma.analytics.findMany({
//       where: { date: today }
//     })
//     const avgResponseAggregation = await prisma.message.findMany({
//       where: { direction: 'OUTBOUND' },
//       take: 100
//     })
//     // naive avg response time placeholder
//     const avgResponseTime = 0

//     return NextResponse.json({
//       totalMessages,
//       totalContacts,
//       avgResponseTime,
//       todayMessages: todayMessages.reduce((s, a) => s + a.messagesReceived + a.messagesSent, 0)
//     })
//   } catch (e) {
//     console.error('Analytics error', e)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }
