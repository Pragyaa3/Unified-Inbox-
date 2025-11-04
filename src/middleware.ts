import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

/**
 * Middleware for protecting routes and API endpoints
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Log requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${req.method}] ${pathname}`)
  }

  // Public routes - no auth required
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/webhooks/twilio']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Protected API routes
  if (pathname.startsWith('/api/')) {
    const authHeader = req.headers.get('authorization')

    // Allow requests without auth for now (for easier development)
    // Remove this condition in production
    if (!authHeader) {
      console.warn(`⚠️  Unauthenticated request to ${pathname}`)
      // In production, uncomment this:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.next()
    }

    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // For now, allow access without auth for development
    // In production, implement proper session checking
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
}