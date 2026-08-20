export type TeeColor = 'blanco' | 'amarillo' | 'azul' | 'rojo' | 'negro' | 'naranja'
export type TeeGender = 'hombres' | 'mujeres' | 'mixto'

export interface CourseTee {
  color: TeeColor
  gender: TeeGender
  /** Course Rating */
  cr: number
  /** Slope Rating */
  slope: number
  par: number
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
