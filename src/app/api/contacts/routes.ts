import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { normalizePhone } from '@/lib/utils'

export async function GET(request: NextRequest) {
  // GET /api/contacts?limit=50
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') || 50)

  const contacts = await prisma.contact.findMany({
    take: limit,
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json({ data: contacts })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email } = body
    const normalized = normalizePhone(phone)

    const contact = await prisma.contact.create({
      data: { name, phone: normalized || phone, email }
    })

    return NextResponse.json({ data: contact })
  } catch (e) {
    console.error('Create contact error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
