export type Channel = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'TWITTER' | 'FACEBOOK'

export type OutboundPayload = {
  to: string
  content?: string
  mediaUrls?: string[]
  subject?: string
  metadata?: Record<string, any>
}

export type InboundMessage = {
  externalId?: string
  from: string
  to?: string
  channel: Channel
  content?: string
  mediaUrls?: string[]
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface ChannelIntegration {
  isConfigured(): boolean
  send(payload: OutboundPayload): Promise<{ success: boolean; sid?: string; error?: string }>
  processWebhook(body: Record<string, any>): Promise<InboundMessage | null>
  validateWebhook?(signature: string, body: any, url: string): boolean
}
