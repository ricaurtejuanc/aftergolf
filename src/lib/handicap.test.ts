import { describe, expect, it } from 'vitest'
import { calculateCourseHandicap, calculateRoundResult } from './handicap'

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
})
