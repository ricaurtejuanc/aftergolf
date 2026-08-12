import type { SavedRound } from './storage'

const PENDING_ROUNDS_KEY = 'aftergolf.pendingRounds'

export function stashPendingRounds(rounds: Omit<SavedRound, 'id'>[]): void {
  localStorage.setItem(PENDING_ROUNDS_KEY, JSON.stringify(rounds))
}

export function takePendingRounds(): Omit<SavedRound, 'id'>[] {
  const raw = localStorage.getItem(PENDING_ROUNDS_KEY)
  localStorage.removeItem(PENDING_ROUNDS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Omit<SavedRound, 'id'>[]
  } catch {
    return []
  }
}
