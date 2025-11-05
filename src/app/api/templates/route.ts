import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const TemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  channel: z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'TWITTER', 'FACEBOOK', 'VOICE']),
  variables: z.array(z.string()).optional(),
})

// First, add Template model to prisma/schema.prisma
// Add this after Analytics model:
/*
model Template {
  id        String   @id @default(cuid())
  name      String
  content   String   @db.Text
  channel   Channel
  variables String[]
  
  userId    String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([channel])
}
*/

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const channel = url.searchParams.get('channel')

    const where: any = {}
    if (channel) {
      where.channel = channel
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('[API] Get templates error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = TemplateSchema.parse(body)

    const template = await prisma.template.create({
      data: validated
    })

    return NextResponse.json({ success: true, data: template }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Create template error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}