import { NextRequest, NextResponse } from 'next/server'
import { processScheduledMessages } from '@/lib/processors/scheduled-messages'

/**
 * GET /api/cron/scheduled-messages
 * Processes scheduled messages
 * 
 * Configure this in Vercel:
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/scheduled-messages",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await processScheduledMessages()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[Cron] Scheduled messages error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}