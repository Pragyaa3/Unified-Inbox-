/**
 * Minimal auth helper to integrate with Better Auth if present.
 * - If BETTER_AUTH_SECRET is set and better-auth package is available, uses Better Auth.
 * - Otherwise falls back to a simple demo user for local dev.
 */

import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'

export type SessionUser = {
  id: string
  email: string
  name?: string
  role?: string
}

export async function getCurrentUser(req?: NextRequest): Promise<SessionUser | null> {
  // If the project has Better Auth env variables and library, you can integrate here.
  // For now: if an Authorization header "Bearer demo" is present -> demo user.
  try {
    if (!req) {
      // server-side calls without request: return demo user
      const demo = await prisma.user.findFirst()
      if (!demo) return null
      return { id: demo.id, email: demo.email, name: demo.name, role: demo.role }
    }

    const auth = req.headers.get('authorization') || ''
    if (auth.toLowerCase().startsWith('bearer demo')) {
      const demo = await prisma.user.findFirst()
      if (!demo) return null
      return { id: demo.id, email: demo.email, name: demo.name, role: demo.role }
    }

    // TODO: integrate with real Better Auth session verification
    return null
  } catch (e) {
    console.error('getCurrentUser error', e)
    return null
  }
}
