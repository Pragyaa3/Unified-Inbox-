// src/app/api/integrations/status/route.ts
import { NextResponse } from 'next/server'
import { IntegrationFactory } from '@/lib/integrations/factory'

export async function GET() {
  const status = IntegrationFactory.getChannelStatus()
  
  return NextResponse.json({
    status,
    configured: Object.entries(status)
      .filter(([, configured]) => configured)
      .map(([channel]) => channel)
  })
}