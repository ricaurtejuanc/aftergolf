// Handicap math following the World Handicap System (WHS), as adopted by the
// Real Federación Española de Golf. Two calculators:
//
// 1. Course Handicap ("handicap de juego"): converts a player's Handicap
//    Index into strokes for the specific tee being played, before the round.
// 2. Post-round result ("handicap jugado"): once the gross score is known,
//    derives net score, Stableford points and the round's Score Differential.

export interface CourseHandicapInput {
  handicapIndex: number
  slopeRating: number
  courseRating: number
  par: number
  /** Handicap allowance, e.g. 1 for 100% (individual stroke play), 0.9 for four-ball. */
  allowance?: number
}

export interface CourseHandicapResult {
  /** Raw value before rounding, kept for display/debugging. */
  exact: number
  /** Course Handicap, rounded to the nearest whole stroke — this is the "handicap de juego". */
  courseHandicap: number
}

/**
 * Course Handicap = Handicap Index x (Slope Rating / 113) + (Course Rating - Par)
 * then scaled by the format's handicap allowance and rounded to the nearest integer.
 */
export function calculateCourseHandicap({
  handicapIndex,
  slopeRating,
  courseRating,
  par,
  allowance = 1,
}: CourseHandicapInput): CourseHandicapResult {
  const exact =
    (handicapIndex * (slopeRating / 113) + (courseRating - par)) * allowance
  return {
    exact,
    courseHandicap: Math.round(exact),
  }
}

export interface RoundResultInput {
  courseHandicap: number
  grossScore: number
  slopeRating: number
  courseRating: number
  par: number
  /** PCC adjustment the course committee can apply for unusual playing conditions, typically -1 to +3. Defaults to 0. */
  pcc?: number
}

export interface RoundResult {
  strokesReceived: number
  netScore: number
  /** Approximate total Stableford points, derived from net score vs. par. */
  stablefordPoints: number
  /** WHS Score Differential for this round, rounded to one decimal. */
  differential: number
}

/**
 * Score Differential = (113 / Slope Rating) x (Gross Score - Course Rating - PCC)
 * Stableford points are approximated from the round total (2 pts/hole at net
 * par, +/-1 per stroke away) since only the 18-hole aggregate is captured.
 */
export function calculateRoundResult({
  courseHandicap,
  grossScore,
  slopeRating,
  courseRating,
  par,
  pcc = 0,
}: RoundResultInput): RoundResult {
  const strokesReceived = courseHandicap
  const netScore = grossScore - strokesReceived
  const stablefordPoints = 36 - (netScore - par)
  const differential =
    Math.round((113 / slopeRating) * (grossScore - courseRating - pcc) * 10) / 10

  return {
    strokesReceived,
    netScore,
    stablefordPoints,
    differential,
  }
}

export const HANDICAP_ALLOWANCES = [
  { value: 1, label: 'Individual stroke play (100%)' },
  { value: 0.95, label: 'Individual match play (95%)' },
  { value: 0.9, label: 'Four-ball stroke play (90%)' },
  { value: 0.85, label: 'Four-ball match play (85%)' },
] as const
