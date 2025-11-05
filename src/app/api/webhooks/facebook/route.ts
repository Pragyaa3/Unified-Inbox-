// src/app/api/webhooks/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { prisma } from '@/lib/db'

// Facebook webhook verification
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhook] Facebook webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Webhook] Received Facebook webhook:', body)

    // Acknowledge immediately
    if (body.object === 'page') {
      const integration = IntegrationFactory.getIntegration('FACEBOOK')
      if (!integration) {
        return NextResponse.json({ success: true })
      }

      const inboundMessage = await integration.processWebhook(body)
      if (!inboundMessage) {
        return NextResponse.json({ success: true })
      }

      // Process message (same pattern as other webhooks)
      // ...
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Facebook error:', error)
    return NextResponse.json({ success: true }) // Always return 200 to Facebook
  }
}