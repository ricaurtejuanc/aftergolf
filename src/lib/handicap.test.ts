import { describe, expect, it } from 'vitest'
import { calculateCourseHandicap, calculateRoundResult, strokesOnHole } from './handicap'

describe('calculateCourseHandicap', () => {
  it('matches a known Aloha Golf Club round (HI 6.1, slope 132, CR 71.2, par 72)', () => {
    const { courseHandicap, exact } = calculateCourseHandicap({
      handicapIndex: 6.1,
      slopeRating: 132,
      courseRating: 71.2,
      par: 72,
    })
    expect(exact).toBeCloseTo(6.326, 3)
    expect(courseHandicap).toBe(6)
  })

  it('applies a handicap allowance for four-ball formats', () => {
    const { courseHandicap } = calculateCourseHandicap({
      handicapIndex: 10,
      slopeRating: 113,
      courseRating: 72,
      par: 72,
      allowance: 0.9,
    })
    expect(courseHandicap).toBe(9)
  })
})

describe('calculateRoundResult', () => {
  it('matches a known Aloha Golf Club round (gross 76 -> net 70, diff 4.1)', () => {
    const result = calculateRoundResult({
      courseHandicap: 6,
      grossScore: 76,
      slopeRating: 132,
      courseRating: 71.2,
      par: 72,
    })
    expect(result.strokesReceived).toBe(6)
    expect(result.netScore).toBe(70)
    expect(result.differential).toBeCloseTo(4.1, 5)
    expect(result.stablefordPoints).toBe(38)
  })

  it('gives 36 points for a net round played exactly to par', () => {
    const result = calculateRoundResult({
      courseHandicap: 10,
      grossScore: 82,
      slopeRating: 113,
      courseRating: 72,
      par: 72,
    })
    expect(result.netScore).toBe(72)
    expect(result.stablefordPoints).toBe(36)
  })

  it('applies a positive PCC adjustment to lower the differential', () => {
    const withoutPcc = calculateRoundResult({
      courseHandicap: 10,
      grossScore: 82,
      slopeRating: 113,
      courseRating: 72,
      par: 72,
    })
    const withPcc = calculateRoundResult({
      courseHandicap: 10,
      grossScore: 82,
      slopeRating: 113,
      courseRating: 72,
      par: 72,
      pcc: 2,
    })
    expect(withPcc.differential).toBeCloseTo(withoutPcc.differential - 2, 5)
  })
})

describe('strokesOnHole', () => {
  it('gives a scratch player (0 strokes) nothing on any hole', () => {
    expect(strokesOnHole(0, 1)).toBe(0)
    expect(strokesOnHole(0, 18)).toBe(0)
  })

  it('gives one stroke on the hardest N holes for a player receiving N strokes', () => {
    expect(strokesOnHole(5, 5)).toBe(1)
    expect(strokesOnHole(5, 6)).toBe(0)
  })

  it('gives every hole a base stroke plus an extra on the hardest holes beyond 18', () => {
    // 20 strokes = 1 base stroke everywhere, plus an extra on the 2 hardest holes
    expect(strokesOnHole(20, 1)).toBe(2)
    expect(strokesOnHole(20, 2)).toBe(2)
    expect(strokesOnHole(20, 3)).toBe(1)
  })
})
