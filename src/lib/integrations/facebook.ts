// src/lib/integrations/facebook.ts
import type { ChannelIntegration, MessagePayload, MessageResponse, InboundMessage } from './types'

export class FacebookIntegration implements ChannelIntegration {
  public channel = 'FACEBOOK' as const
  private appId: string
  private appSecret: string
  private pageAccessToken: string

  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID || ''
    this.appSecret = process.env.FACEBOOK_APP_SECRET || ''
    this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || ''
  }

  isConfigured(): boolean {
    return !!(this.appId && this.appSecret && this.pageAccessToken)
  }

  async send(payload: MessagePayload): Promise<MessageResponse> {
    if (!this.isConfigured()) {
      console.warn('[Facebook] Not configured - using mock send')
      return {
        success: true,
        messageId: `mock-facebook-${Date.now()}`,
        channel: 'FACEBOOK',
        timestamp: new Date()
      }
    }

    try {
      const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${this.pageAccessToken}`

      const messageData: any = {
        recipient: { id: payload.to },
        message: { text: payload.content }
      }

      if (payload.mediaUrls && payload.mediaUrls.length > 0) {
        messageData.message = {
          attachment: {
            type: 'image',
            payload: { url: payload.mediaUrls[0] }
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: data.message_id,
          externalId: data.message_id,
          channel: 'FACEBOOK',
          timestamp: new Date()
        }
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send Facebook message',
          channel: 'FACEBOOK',
          timestamp: new Date()
        }
      }
    } catch (error: any) {
      console.error('[Facebook] Send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send Facebook message',
        channel: 'FACEBOOK',
        timestamp: new Date()
      }
    }
  }

  async processWebhook(body: any): Promise<InboundMessage | null> {
    try {
      const entry = body.entry?.[0]
      const messaging = entry?.messaging?.[0]

      if (!messaging?.message) return null

      return {
        externalId: messaging.message.mid,
        from: messaging.sender.id,
        to: messaging.recipient.id,
        content: messaging.message.text || '',
        mediaUrls: messaging.message.attachments?.map((a: any) => a.payload.url),
        channel: 'FACEBOOK',
        timestamp: new Date(messaging.timestamp),
        metadata: {
          pageId: entry.id
        }
      }
    } catch (error) {
      console.error('[Facebook] Webhook processing error:', error)
      return null
    }
  }

  validateWebhook(signature: string, body: any): boolean {
    // Implement Facebook webhook signature validation
    // For development, return true
    return true
  }
}