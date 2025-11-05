import env from './env'

export const isBetterAuthConfigured = Boolean(
  env.BETTER_AUTH_SECRET && env.BETTER_AUTH_URL
)

export const betterAuthConfig = {
  baseUrl: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: env.BETTER_AUTH_SECRET || env.JWT_SECRET || '',
  providers: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || ''
    }
  }
}

/**
 * Check if authentication is enabled
 */
export function isAuthEnabled() {
  return isBetterAuthConfigured
}