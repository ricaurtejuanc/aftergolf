import type { es } from '../i18n/es'

export function translateAuthError(error: unknown, messages: typeof es.authErrors): string {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) return messages.invalidCredentials
  if (lower.includes('already registered')) return messages.alreadyRegistered
  if (lower.includes('email not confirmed')) return messages.emailNotConfirmed
  if (lower.includes('password') && lower.includes('at least')) return messages.passwordTooShort
  if (lower.includes('rate limit')) return messages.rateLimit
  if (lower.includes('provider is not enabled')) return messages.googleNotEnabled
  return messages.generic
}
