import type { HoleScore } from '../data/courses'
import { supabase } from './supabaseClient'

interface HoleScoreRow {
  hole_number: number
  meters: number
  par: number
  hcp: number
}

export async function loadHoleScores(teeId: string): Promise<HoleScore[]> {
  const { data, error } = await supabase
    .from('hole_scores')
    .select('hole_number, meters, par, hcp')
    .eq('tee_id', teeId)
    .order('hole_number')
  if (error || !data) return []
  return (data as HoleScoreRow[]).map((r) => ({
    holeNumber: r.hole_number,
    meters: r.meters,
    par: r.par,
    hcp: r.hcp,
  }))
}
