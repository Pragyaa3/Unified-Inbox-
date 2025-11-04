import { Twilio } from 'twilio'
import type { ChannelIntegration, MessagePayload, MessageResponse, InboundMessage, Channel } from './types'

export class TwilioIntegration implements ChannelIntegration {
  private client: Twilio | null
  private phoneNumber: string
  private whatsappNumber?: string
  public channel: Channel

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    this.client = accountSid && authToken ? new Twilio(accountSid, authToken) : null
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || ''
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER
    this.channel = 'SMS' // Default, can be overridden
  }

  isConfigured(): boolean {
    return !!(this.client && this.phoneNumber)
  }

  async send(payload: MessagePayload): Promise<MessageResponse> {
    if (!this.client || !this.isConfigured()) {
      console.warn('[Twilio] Not configured - using mock send')
      return {
        success: true,
        sid: `mock-${Date.now()}`,
        channel: this.channel,
        timestamp: new Date()
      }
    }

    try {
      const isWhatsApp = payload.to.includes('whatsapp:') || this.channel === 'WHATSAPP'
      const from = isWhatsApp 
        ? (this.whatsappNumber || `whatsapp:${this.phoneNumber}`)
        : this.phoneNumber

      const to = isWhatsApp && !payload.to.startsWith('whatsapp:')
        ? `whatsapp:${payload.to}`
        : payload.to

      const messageData: any = {
        from,
        to,
        body: payload.content
      }

      if (payload.mediaUrls && payload.mediaUrls.length > 0) {
        messageData.mediaUrl = payload.mediaUrls
      }

      const message = await this.client.messages.create(messageData)

      return {
        success: true,
        sid: message.sid,
        externalId: message.sid,
        channel: isWhatsApp ? 'WHATSAPP' : 'SMS',
        timestamp: new Date()
      }
    } catch (error: any) {
      console.error('[Twilio] Send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send message',
        channel: this.channel,
        timestamp: new Date()
      }
    }
  }

  async processWebhook(body: any): Promise<InboundMessage | null> {
    try {
      const from = body.From || body.from
      const content = body.Body || body.body
      const messageSid = body.MessageSid || body.messageSid

      if (!from || !content) {
        console.error('[Twilio] Invalid webhook payload')
        return null
      }

      const isWhatsApp = from.startsWith('whatsapp:')
      const normalizedFrom = from.replace('whatsapp:', '')

      const mediaUrls: string[] = []
      const numMedia = parseInt(body.NumMedia || '0', 10)
      
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = body[`MediaUrl${i}`]
        if (mediaUrl) mediaUrls.push(mediaUrl)
      }

      return {
        externalId: messageSid,
        from: normalizedFrom,
        to: body.To,
        content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        channel: isWhatsApp ? 'WHATSAPP' : 'SMS',
        timestamp: new Date(),
        metadata: {
          accountSid: body.AccountSid,
          messageSid,
          status: body.SmsStatus || body.MessageStatus
        }
      }
    } catch (error) {
      console.error('[Twilio] Webhook processing error:', error)
      return null
    }
  }

  validateWebhook(signature: string, body: any, url?: string): boolean {
    // For development: return true
    // For production: implement proper Twilio signature validation
    return true
  }
}