// src/lib/integrations/email.ts
import type { ChannelIntegration, MessagePayload, MessageResponse, InboundMessage } from './types'

export class EmailIntegration implements ChannelIntegration {
  public channel = 'EMAIL' as const
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ''
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async send(payload: MessagePayload): Promise<MessageResponse> {
    if (!this.isConfigured()) {
      console.warn('[Email] Not configured - using mock send')
      return {
        success: true,
        messageId: `mock-email-${Date.now()}`,
        channel: 'EMAIL',
        timestamp: new Date()
      }
    }

    try {
      // Using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@yourdomain.com',
          to: payload.to,
          subject: 'Message from Unified Inbox',
          html: payload.content
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: data.id,
          externalId: data.id,
          channel: 'EMAIL',
          timestamp: new Date()
        }
      } else {
        return {
          success: false,
          error: data.message || 'Failed to send email',
          channel: 'EMAIL',
          timestamp: new Date()
        }
      }
    } catch (error: any) {
      console.error('[Email] Send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
        channel: 'EMAIL',
        timestamp: new Date()
      }
    }
  }

  async processWebhook(body: any): Promise<InboundMessage | null> {
    try {
      // Resend webhook format
      return {
        externalId: body.id,
        from: body.from,
        to: body.to,
        content: body.text || body.html,
        channel: 'EMAIL',
        timestamp: new Date(body.created_at),
        metadata: {
          subject: body.subject,
          headers: body.headers
        }
      }
    } catch (error) {
      console.error('[Email] Webhook processing error:', error)
      return null
    }
  }
}