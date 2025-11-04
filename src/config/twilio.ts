// src/config/twilio.ts
import { Twilio } from 'twilio'
import env from './env'

/**
 * Lightweight Twilio wrapper.
 * - If TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN are present, returns a Twilio client.
 * - Else, returns null and the rest of the code will use mock behavior.
 */

let twilioClient: Twilio | null = null

if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  } catch (e) {
    console.warn('[twilio] failed to construct client:', e)
    twilioClient = null
  }
} else {
  if (env.NODE_ENV !== 'production') {
    console.warn('[twilio] TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not set — using mock mode.')
  }
}

export function getTwilioClient() {
  return twilioClient
}

/**
 * Returns the `from` value appropriate for a given channel.
 * For WhatsApp Twilio expects `whatsapp:+...`
 */
export function getDefaultFrom(channel: 'SMS' | 'WHATSAPP' | string) {
  if (channel === 'WHATSAPP') {
    // prefer explicit WHATSAPP env var, else convert TWILIO_PHONE_NUMBER
    if (env.TWILIO_WHATSAPP_NUMBER) return env.TWILIO_WHATSAPP_NUMBER
    if (env.TWILIO_PHONE_NUMBER) {
      const n = env.TWILIO_PHONE_NUMBER
      if (n.startsWith('whatsapp:')) return n
      return `whatsapp:${n}`
    }
  }
  return env.TWILIO_PHONE_NUMBER || ''
}

/**
 * Placeholder for webhook validation. If you want full validation, use:
 * const { RequestValidator } = require('twilio').jwt
 */
export function validateTwilioRequest(signature: string, url: string, params: Record<string, any>) {
  // Development: skip validation to allow local testing without Twilio helper lib
  if (!twilioClient) return true
  // If you want to enable, import request validator from 'twilio' and validate.
  return true
}
