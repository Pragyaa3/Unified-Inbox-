import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production'

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: string
}

/**
 * Verify JWT token and return user
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      iat?: number
      exp?: number
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error('[Auth] Token verification failed:', error)
    return null
  }
}

/**
 * Get current user from request
 */
export async function getCurrentUser(req: NextRequest): Promise<SessionUser | null> {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split(' ')[1]
    return await verifyToken(token)
  } catch (error) {
    console.error('[Auth] Get current user error:', error)
    return null
  }
}

/**
 * Create JWT token for user
 */
export function createToken(user: { id: string; email: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  )
}

/**
 * Check if user has required role
 */
export function hasRole(user: SessionUser, requiredRole: 'VIEWER' | 'EDITOR' | 'ADMIN'): boolean {
  const roleHierarchy = { VIEWER: 1, EDITOR: 2, ADMIN: 3 }
  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}