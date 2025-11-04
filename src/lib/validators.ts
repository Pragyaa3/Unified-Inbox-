import { z } from 'zod'

/**
 * Phone number validation
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (use E.164 format: +1234567890)')

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * Contact validation
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: phoneSchema.optional().nullable(),
  email: emailSchema.optional().nullable(),
  whatsapp: phoneSchema.optional().nullable(),
  twitterHandle: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
    .optional()
    .nullable(),
  facebookId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
})

/**
 * Message validation
 */
export const messageSchema = z.object({
  contactId: z.string().cuid('Invalid contact ID'),
  channel: z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'TWITTER', 'FACEBOOK', 'VOICE']),
  content: z.string().min(1, 'Message content is required').max(4096),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime().optional(),
})

/**
 * Note validation
 */
export const noteSchema = z.object({
  contactId: z.string().cuid('Invalid contact ID'),
  content: z.string().min(1, 'Note content is required'),
  isPrivate: z.boolean().optional(),
})

/**
 * User registration validation
 */
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * Login validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * Team validation
 */
export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})