const ADMIN_PIN = 'aftergolf2026'
const ADMIN_KEY = 'aftergolf.isAdmin'

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
