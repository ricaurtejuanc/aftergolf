const ADMIN_PIN = 'aftergolf2026'
const ADMIN_KEY = 'aftergolf.isAdmin'

/**
 * The only email allowed to write to courses/tees/products (enforced for
 * real by the Row Level Security policies in Supabase — this constant is
 * just so the UI can show the right prompt, not the actual security check).
 */
export const ADMIN_EMAIL = 'ricaurtejuanc@gmail.com'

export function isAdminUnlocked(): boolean {
  return localStorage.getItem(ADMIN_KEY) === 'true'
}

export function unlockAdmin(pin: string): boolean {
  if (pin !== ADMIN_PIN) return false
  localStorage.setItem(ADMIN_KEY, 'true')
  return true
}

export function lockAdmin(): void {
  localStorage.removeItem(ADMIN_KEY)
}
