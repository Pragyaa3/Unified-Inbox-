export function normalizePhone(phone?: string | null) {
  if (!phone) return null
  // naive normalization: remove non-digit, ensure leading +
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    // assume India local format, prefix +91 (only if you want — we return E.164 neutral)
    return `+${digits}`
  }
  return `+${digits}`
}

export function nowISO() {
  return new Date().toISOString()
}
