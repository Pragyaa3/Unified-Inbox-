import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'

const TeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
})

/**
 * GET /api/teams
 */
export async function GET(request: NextRequest) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: teams })
  } catch (error) {
    console.error('[API] Get teams error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

/**
 * POST /api/teams
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = TeamSchema.parse(body)

    // Check if slug already exists
    const existing = await prisma.team.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Team with this slug already exists' }, { status: 409 })
    }

    const team = await prisma.team.create({
      data: validated,
    })

    return NextResponse.json({ success: true, data: team }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Create team error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}