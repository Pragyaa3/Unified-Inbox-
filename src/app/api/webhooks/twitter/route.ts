// src/app/api/webhooks/twitter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'
import { prisma } from '@/lib/db'

// Twitter requires CRC validation
export async function GET(request: NextRequest) {
  const crc = request.nextUrl.searchParams.get('crc_token')
  
  if (!crc) {
    return NextResponse.json({ error: 'Missing crc_token' }, { status: 400 })
  }

  // Validate CRC (implement proper HMAC-SHA256 validation)
  const response_token = `sha256=${crc}` // Simplified - implement proper validation
  
  return NextResponse.json({ response_token })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Webhook] Received Twitter webhook:', body)

    const integration = IntegrationFactory.getIntegration('TWITTER')
    if (!integration) {
      return NextResponse.json({ error: 'Twitter integration not configured' }, { status: 500 })
    }

    const inboundMessage = await integration.processWebhook(body)
    if (!inboundMessage) {
      return NextResponse.json({ success: true }) // Acknowledge but ignore
    }

    // Process similar to email webhook
    // ... (same pattern as email webhook)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Twitter error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}