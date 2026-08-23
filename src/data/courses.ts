export type TeeColor = 'blanco' | 'amarillo' | 'azul' | 'rojo' | 'negro' | 'naranja'
export type TeeGender = 'hombres' | 'mujeres' | 'mixto'

export interface CourseTee {
  /** DB row id — only present for tees loaded from our own courses table,
   * not for ones synthesized from a GolfCourseAPI lookup. Used to fetch this
   * tee's hole-by-hole scorecard, when one exists. */
  id?: string
  color: TeeColor
  gender: TeeGender
  /** Course Rating */
  cr: number
  /** Slope Rating */
  slope: number
  par: number
}

export interface HoleScore {
  holeNumber: number
  meters: number
  par: number
  hcp: number
}

export interface CourseRound {
  id: string
  name: string
  tees: CourseTee[]
}

export interface GolfCourse {
  id: string
  name: string
  location: string
  rounds: CourseRound[]
}
