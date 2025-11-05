// src/lib/integrations/twitter.ts
import type { ChannelIntegration, MessagePayload, MessageResponse, InboundMessage } from './types'

export class TwitterIntegration implements ChannelIntegration {
  public channel = 'TWITTER' as const
  private bearerToken: string

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || ''
  }

  isConfigured(): boolean {
    return !!this.bearerToken
  }

  async send(payload: MessagePayload): Promise<MessageResponse> {
    if (!this.isConfigured()) {
      console.warn('[Twitter] Not configured - using mock send')
      return {
        success: true,
        messageId: `mock-twitter-${Date.now()}`,
        channel: 'TWITTER',
        timestamp: new Date()
      }
    }

    try {
      // Twitter API v2 - Send DM
      const response = await fetch('https://api.twitter.com/2/dm_conversations/with/:participant_id/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: payload.content,
          attachments: payload.mediaUrls ? { media_ids: payload.mediaUrls } : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: data.data.dm_event_id,
          externalId: data.data.dm_event_id,
          channel: 'TWITTER',
          timestamp: new Date()
        }
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.message || 'Failed to send Twitter DM',
          channel: 'TWITTER',
          timestamp: new Date()
        }
      }
    } catch (error: any) {
      console.error('[Twitter] Send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send Twitter DM',
        channel: 'TWITTER',
        timestamp: new Date()
      }
    }
  }

  async processWebhook(body: any): Promise<InboundMessage | null> {
    try {
      const event = body.direct_message_events?.[0]

      if (!event) return null

      return {
        externalId: event.id,
        from: event.message_create.sender_id,
        to: event.message_create.target.recipient_id,
        content: event.message_create.message_data.text,
        channel: 'TWITTER',
        timestamp: new Date(parseInt(event.created_timestamp)),
        metadata: {
          entities: event.message_create.message_data.entities
        }
      }
    } catch (error) {
      console.error('[Twitter] Webhook processing error:', error)
      return null
    }
  }
}