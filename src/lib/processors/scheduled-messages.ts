import prisma from '@/lib/db'
import { IntegrationFactory } from '@/lib/integrations/factory'

/**
 * Process scheduled messages that are due to be sent
 * Run this as a cron job or background worker
 */
export async function processScheduledMessages() {
  console.log('[Scheduler] Processing scheduled messages...')

  try {
    const now = new Date()

    // Find all scheduled messages that are due
    const scheduledMessages = await prisma.message.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        contact: true,
      },
      take: 50, // Process in batches
    })

    console.log(`[Scheduler] Found ${scheduledMessages.length} messages to send`)

    for (const message of scheduledMessages) {
      try {
        // Get integration for channel
        const integration = IntegrationFactory.getIntegration(message.channel)

        if (!integration || !integration.isConfigured()) {
          console.warn(`[Scheduler] Integration ${message.channel} not configured`)
          
          // Mark as failed
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: 'FAILED',
              errorMessage: 'Integration not configured',
            },
          })
          continue
        }

        // Determine recipient
        const to =
          message.channel === 'WHATSAPP'
            ? message.contact.whatsapp || message.contact.phone
            : message.contact.phone || message.contact.email

        if (!to) {
          console.warn(`[Scheduler] No recipient for message ${message.id}`)
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: 'FAILED',
              errorMessage: 'No recipient contact information',
            },
          })
          continue
        }

        // Send message
        const result = await integration.send({
          to,
          content: message.content,
          mediaUrls: message.mediaUrls,
        })

        if (result.success) {
          // Update message status
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              externalId: result.sid,
            },
          })

          // Update analytics
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          await prisma.analytics.upsert({
            where: {
              date_channel: {
                date: today,
                channel: message.channel,
              },
            },
            update: {
              messagesSent: { increment: 1 },
            },
            create: {
              date: today,
              channel: message.channel,
              messagesSent: 1,
            },
          })

          console.log(`[Scheduler] Successfully sent message ${message.id}`)
        } else {
          // Mark as failed
          await prisma.message.update({
            where: { id: message.id },
            data: {
              status: 'FAILED',
              errorMessage: result.error || 'Unknown error',
            },
          })

          console.error(`[Scheduler] Failed to send message ${message.id}:`, result.error)
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing message ${message.id}:`, error)
        
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      }
    }

    console.log('[Scheduler] Finished processing scheduled messages')
    return {
      processed: scheduledMessages.length,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('[Scheduler] Fatal error:', error)
    throw error
  }
}

/**
 * API endpoint to trigger scheduler manually
 * In production, use a real cron service like Vercel Cron or GitHub Actions
 */