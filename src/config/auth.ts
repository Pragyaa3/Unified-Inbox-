// src/config/auth.ts
import env from './env'

export const isBetterAuthConfigured = Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_URL)

export const betterAuthConfig = {
  baseUrl: env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: env.BETTER_AUTH_SECRET || '',
  providers: {
    // Example place for Google credentials — wire into Better Auth / NextAuth optionally
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  }
}

/**
 * Simple helper: for local/demo you can use "Bearer demo" to act as the seeded user.
 * When you integrate Better Auth, replace getAuthHeaderUser / verifyAuthToken with real checks.
 */
export function isAuthEnabled() {
  return isBetterAuthConfigured
}
