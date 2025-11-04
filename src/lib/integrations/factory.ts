import { TwilioIntegration } from './twilio'
import type { ChannelIntegration, Channel } from './types'

export class IntegrationFactory {
  private static integrations: Map<Channel, ChannelIntegration> = new Map()
  private static initialized = false

  static initialize() {
    if (this.initialized) return

    // Initialize Twilio for SMS and WhatsApp
    const twilioSMS = new TwilioIntegration()
    twilioSMS.channel = 'SMS'
    this.integrations.set('SMS', twilioSMS)

    const twilioWhatsApp = new TwilioIntegration()
    twilioWhatsApp.channel = 'WHATSAPP'
    this.integrations.set('WHATSAPP', twilioWhatsApp)

    this.initialized = true
  }

  static getIntegration(channel: Channel | string): ChannelIntegration | null {
    this.initialize()
    return this.integrations.get(channel as Channel) || null
  }

  static getAllIntegrations(): ChannelIntegration[] {
    this.initialize()
    return Array.from(this.integrations.values())
  }

  static isChannelConfigured(channel: Channel | string): boolean {
    const integration = this.getIntegration(channel)
    return integration ? integration.isConfigured() : false
  }

  static getConfiguredChannels(): Channel[] {
    this.initialize()
    return Array.from(this.integrations.keys()).filter(channel =>
      this.isChannelConfigured(channel)
    )
  }
}

// Initialize on import
IntegrationFactory.initialize()