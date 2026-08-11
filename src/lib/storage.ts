import type { TeeColor, TeeGender } from '../data/courses'

export interface SavedRound {
  id: string
  courseName: string
  courseLocation: string
  teeColor: TeeColor
  teeGender: TeeGender
  courseRating: number
  slopeRating: number
  par: number
  handicapIndex: number
  courseHandicap: number
  grossScore: number
  strokesReceived: number
  netScore: number
  stablefordPoints: number
  differential: number
  datePlayed: string
}

const ROUNDS_KEY = 'aftergolf.rounds'
const HANDICAP_KEY = 'aftergolf.handicapIndex'

export function loadRounds(): SavedRound[] {
  try {
    const raw = localStorage.getItem(ROUNDS_KEY)
    return raw ? (JSON.parse(raw) as SavedRound[]) : []
  } catch {
    return []
  }
}

export function saveRound(round: SavedRound): SavedRound[] {
  const rounds = [round, ...loadRounds()]
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds))
  return rounds
}

export function deleteRound(id: string): SavedRound[] {
  const rounds = loadRounds().filter((r) => r.id !== id)
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds))
  return rounds
}

export function loadHandicapIndex(): number | null {
  const raw = localStorage.getItem(HANDICAP_KEY)
  return raw ? Number(raw) : null
}

export function saveHandicapIndex(value: number): void {
  localStorage.setItem(HANDICAP_KEY, String(value))
}
