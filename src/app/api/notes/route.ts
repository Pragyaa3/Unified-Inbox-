import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const NoteSchema = z.object({
  contactId: z.string().cuid(),
  content: z.string().min(1),
  isPrivate: z.boolean().optional(),
})

/**
 * GET /api/notes?contactId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const contactId = url.searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const notes = await prisma.note.findMany({
      where: { contactId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: notes })
  } catch (error) {
    console.error('[API] Get notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

/**
 * POST /api/notes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = NoteSchema.parse(body)

    // Get user ID from header (set by middleware)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      // For development, use demo user
      const demoUser = await prisma.user.findFirst()
      if (!demoUser) {
        return NextResponse.json({ error: 'No user found' }, { status: 401 })
      }

      const note = await prisma.note.create({
        data: {
          contactId: validated.contactId,
          authorId: demoUser.id,
          content: validated.content,
          isPrivate: validated.isPrivate || false,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, data: note }, { status: 201 })
    }

    const note = await prisma.note.create({
      data: {
        contactId: validated.contactId,
        authorId: userId,
        content: validated.content,
        isPrivate: validated.isPrivate || false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: note }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Create note error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}