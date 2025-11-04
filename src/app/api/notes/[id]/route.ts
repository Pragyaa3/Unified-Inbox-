import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const UpdateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  isPrivate: z.boolean().optional(),
})

/**
 * PATCH /api/notes/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = UpdateNoteSchema.parse(body)

    const note = await prisma.note.update({
      where: { id: params.id },
      data: validated,
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

    return NextResponse.json({ success: true, data: note })
  } catch (error: any) {
    console.error('[API] Update note error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

/**
 * DELETE /api/notes/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.note.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Note deleted' })
  } catch (error: any) {
    console.error('[API] Delete note error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}