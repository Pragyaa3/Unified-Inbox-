import { TwilioIntegration } from './twilio'
import type { ChannelIntegration } from './types'

export class IntegrationFactory {
  static getIntegration(channel: string): ChannelIntegration | null {
    // Simple factory mapping — expand as you add other integrations
    if (channel === 'SMS' || channel === 'WHATSAPP') {
      return new TwilioIntegration()
    }
    // Add other integrations here
    return null
  }
}
