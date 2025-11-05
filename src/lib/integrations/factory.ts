// src/lib/integrations/factory.ts (Updated)
import { TwilioIntegration } from './twilio'
import { EmailIntegration } from './email'
import { TwitterIntegration } from './twitter'
import { FacebookIntegration } from './facebook'
import type { ChannelIntegration, Channel } from './types'

export class IntegrationFactory {
  private static integrations: Map<Channel, ChannelIntegration> = new Map()
  private static initialized = false

  static initialize() {
    if (this.initialized) return

    // Initialize SMS
    const twilioSMS = new TwilioIntegration()
    twilioSMS.channel = 'SMS'
    this.integrations.set('SMS', twilioSMS)

    // Initialize WhatsApp
    const twilioWhatsApp = new TwilioIntegration()
    twilioWhatsApp.channel = 'WHATSAPP'
    this.integrations.set('WHATSAPP', twilioWhatsApp)

    // Initialize Email
    const email = new EmailIntegration()
    this.integrations.set('EMAIL', email)

    // Initialize Twitter
    const twitter = new TwitterIntegration()
    this.integrations.set('TWITTER', twitter)

    // Initialize Facebook
    const facebook = new FacebookIntegration()
    this.integrations.set('FACEBOOK', facebook)

    this.initialized = true
    
    console.log('[IntegrationFactory] Initialized with channels:', 
      Array.from(this.integrations.keys()))
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

  static getChannelStatus() {
    this.initialize()
    const status: Record<string, boolean> = {}
    
    Array.from(this.integrations.entries()).forEach(([channel, integration]) => {
      status[channel] = integration.isConfigured()
    })
    
    return status
  }
}

// Initialize on import
IntegrationFactory.initialize()