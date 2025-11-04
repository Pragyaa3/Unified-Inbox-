import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') || 50)
  const search = url.searchParams.get('search')

  try {
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    const contacts = await prisma.contact.findMany({
      where,
      take: limit,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { lastContactedAt: 'desc' }
    })

    return NextResponse.json({ data: contacts })
  } catch (error) {
    console.error('[API] Get contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ContactSchema.parse(body)

    // Check for duplicates
    if (validated.email || validated.phone) {
      const existing = await prisma.contact.findFirst({
        where: {
          OR: [
            validated.email ? { email: validated.email } : {},
            validated.phone ? { phone: validated.phone } : {}
          ].filter(c => Object.keys(c).length > 0)
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Contact already exists', existingContact: existing },
          { status: 409 }
        )
      }
    }

    const contact = await prisma.contact.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        whatsapp: validated.whatsapp,
        twitterHandle: validated.twitterHandle,
        facebookId: validated.facebookId,
        tags: validated.tags || []
      }
    })

    return NextResponse.json({
      success: true,
      data: contact
    }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Create contact error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}