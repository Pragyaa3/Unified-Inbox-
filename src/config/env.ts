/**
 * Centralized environment configuration
 */

type Env = {
  NODE_ENV: string
  DATABASE_URL: string
  NEXT_PUBLIC_APP_URL: string
  JWT_SECRET: string
  
  // Better Auth (optional)
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  
  // Twilio
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_PHONE_NUMBER?: string
  TWILIO_WHATSAPP_NUMBER?: string
  
  // Optional services
  RESEND_API_KEY?: string
  TWITTER_BEARER_TOKEN?: string
  FACEBOOK_APP_ID?: string
  FACEBOOK_APP_SECRET?: string
}

const raw = process.env

export const env: Env = {
  NODE_ENV: raw.NODE_ENV || 'development',
  DATABASE_URL: raw.DATABASE_URL || '',
  NEXT_PUBLIC_APP_URL: raw.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  JWT_SECRET: raw.JWT_SECRET || 'dev_secret_change_in_production',
  
  // Better Auth
  BETTER_AUTH_SECRET: raw.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: raw.BETTER_AUTH_URL,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,
  
  // Twilio
  TWILIO_ACCOUNT_SID: raw.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: raw.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: raw.TWILIO_PHONE_NUMBER,
  TWILIO_WHATSAPP_NUMBER: raw.TWILIO_WHATSAPP_NUMBER,
  
  // Optional services
  RESEND_API_KEY: raw.RESEND_API_KEY,
  TWITTER_BEARER_TOKEN: raw.TWITTER_BEARER_TOKEN,
  FACEBOOK_APP_ID: raw.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: raw.FACEBOOK_APP_SECRET,
}

// Validation warnings
if (!env.DATABASE_URL && env.NODE_ENV !== 'test') {
  console.warn('⚠️  DATABASE_URL is not set')
}

if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
  console.warn('⚠️  Twilio credentials not set - SMS/WhatsApp will use mock mode')
}

export default env