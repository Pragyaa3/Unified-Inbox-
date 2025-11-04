export type Channel = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'TWITTER' | 'FACEBOOK' | 'VOICE'

export interface MessagePayload {
  to: string
  content: string
  mediaUrls?: string[]
  scheduledFor?: Date
  metadata?: Record<string, any>
}

export interface MessageResponse {
  success: boolean
  sid?: string
  messageId?: string
  externalId?: string
  error?: string
  channel?: Channel
  timestamp?: Date
}

export interface InboundMessage {
  externalId?: string
  from: string
  to?: string
  channel: Channel
  content: string
  mediaUrls?: string[]
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ChannelIntegration {
  channel: Channel
  isConfigured(): boolean
  send(payload: MessagePayload): Promise<MessageResponse>
  processWebhook(body: any): Promise<InboundMessage | null>
  validateWebhook?(signature: string, body: any, url?: string): boolean
}