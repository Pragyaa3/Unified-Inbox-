import { Twilio } from 'twilio'
import type { ChannelIntegration, InboundMessage, OutboundPayload } from './types'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = accountSid && authToken ? new Twilio(accountSid, authToken) : null

export class TwilioIntegration implements ChannelIntegration {
  isConfigured() {
    return !!twilioClient
  }

  async send(payload: OutboundPayload) {
    if (!twilioClient) {
      // fallback: mock send
      console.warn('Twilio not configured — using mock send')
      return { success: true, sid: 'mock-sid' }
    }

    try {
      const from = process.env.TWILIO_PHONE_NUMBER
      if (!from) throw new Error('TWILIO_PHONE_NUMBER not set')

      const params: any = {
        to: payload.to,
        from,
      }

      if (payload.mediaUrls && payload.mediaUrls.length > 0) {
        params.mediaUrl = payload.mediaUrls
      }

      // Twilio chooses channel from phone numbers; for WhatsApp you must use 'whatsapp:+...' in 'from'/'to'
      if (payload.content) params.body = payload.content

      const msg = await twilioClient.messages.create(params)
      return { success: true, sid: msg.sid }
    } catch (err: any) {
      console.error('Twilio send error', err)
      return { success: false, error: err.message }
    }
  }

  async processWebhook(body: Record<string, any>) {
    // Twilio sends form-urlencoded; this expects fields like Body, From, To, MessageSid, NumMedia...
    const fromRaw = body.From || ''
    const toRaw = body.To || ''
    const isWhatsApp = fromRaw?.toString().startsWith('whatsapp:')
    const content = body.Body || ''
    const numMedia = Number(body.NumMedia || 0)
    const mediaUrls: string[] = []

    for (let i = 0; i < numMedia; i++) {
      const key = `MediaUrl${i}`
      if (body[key]) mediaUrls.push(body[key].toString())
    }

    const message: InboundMessage = {
      externalId: body.MessageSid || undefined,
      from: fromRaw.toString(),
      to: toRaw.toString(),
      channel: isWhatsApp ? 'WHATSAPP' : 'SMS',
      content: content.toString(),
      mediaUrls,
      timestamp: new Date()
    }

    return message
  }

  validateWebhook(signature: string, body: any, url: string) {
    // For now: skip validation in dev. You can add Twilio RequestValidator here.
    return true
  }
}
