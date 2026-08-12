import type { TeeColor, TeeGender } from '../data/courses'
import { supabase } from './supabaseClient'

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
  /** PCC adjustment applied by the course committee, if any. Defaults to 0. */
  pcc?: number
  datePlayed: string
  /** Set when the round was saved as part of a multi-player group (e.g. "Jugador 2"). */
  playerLabel?: string
}

interface RoundRow {
  id: string
  course_name: string
  course_location: string
  tee_color: TeeColor
  tee_gender: TeeGender
  course_rating: number
  slope_rating: number
  par: number
  handicap_index: number
  course_handicap: number
  gross_score: number
  strokes_received: number
  net_score: number
  stableford_points: number
  differential: number
  pcc: number | null
  date_played: string
  player_label: string | null
}

function fromRow(row: RoundRow): SavedRound {
  return {
    id: row.id,
    courseName: row.course_name,
    courseLocation: row.course_location,
    teeColor: row.tee_color,
    teeGender: row.tee_gender,
    courseRating: row.course_rating,
    slopeRating: row.slope_rating,
    par: row.par,
    handicapIndex: row.handicap_index,
    courseHandicap: row.course_handicap,
    grossScore: row.gross_score,
    strokesReceived: row.strokes_received,
    netScore: row.net_score,
    stablefordPoints: row.stableford_points,
    differential: row.differential,
    pcc: row.pcc ?? 0,
    datePlayed: row.date_played,
    playerLabel: row.player_label ?? undefined,
  }
}

export async function loadRounds(): Promise<SavedRound[]> {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as RoundRow[]).map(fromRow)
}

export async function saveRound(round: Omit<SavedRound, 'id'>, userId: string): Promise<void> {
  const { error } = await supabase.from('rounds').insert({
    user_id: userId,
    course_name: round.courseName,
    course_location: round.courseLocation,
    tee_color: round.teeColor,
    tee_gender: round.teeGender,
    course_rating: round.courseRating,
    slope_rating: round.slopeRating,
    par: round.par,
    handicap_index: round.handicapIndex,
    course_handicap: round.courseHandicap,
    gross_score: round.grossScore,
    strokes_received: round.strokesReceived,
    net_score: round.netScore,
    stableford_points: round.stablefordPoints,
    differential: round.differential,
    pcc: round.pcc ?? 0,
    date_played: round.datePlayed,
    player_label: round.playerLabel ?? null,
  })
  if (error) throw error
}

export async function deleteRound(id: string): Promise<void> {
  const { error } = await supabase.from('rounds').delete().eq('id', id)
  if (error) throw error
}

const HANDICAP_KEY = 'aftergolf.handicapIndex'

export function loadHandicapIndex(): number | null {
  const raw = localStorage.getItem(HANDICAP_KEY)
  return raw ? Number(raw) : null
}

export function saveHandicapIndex(value: number): void {
  localStorage.setItem(HANDICAP_KEY, String(value))
}
