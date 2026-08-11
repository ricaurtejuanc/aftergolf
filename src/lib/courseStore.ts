import { COURSES as SEED_COURSES, type CourseTee, type GolfCourse } from '../data/courses'

const COURSES_KEY = 'aftergolf.courses'

export function loadCourses(): GolfCourse[] {
  try {
    const raw = localStorage.getItem(COURSES_KEY)
    if (raw) return JSON.parse(raw) as GolfCourse[]
  } catch {
    // fall through to seed
  }
  saveCourses(SEED_COURSES)
  return SEED_COURSES
}

export function saveCourses(courses: GolfCourse[]): void {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'campo'
  )
}

export function addCourse(input: { name: string; location: string }): GolfCourse[] {
  const courses = loadCourses()
  const baseId = slugify(input.name)
  let id = baseId
  let n = 2
  while (courses.some((c) => c.id === id)) {
    id = `${baseId}-${n++}`
  }
  const updated = [...courses, { id, name: input.name, location: input.location, tees: [] }]
  saveCourses(updated)
  return updated
}

export function updateCourse(
  id: string,
  patch: { name: string; location: string },
): GolfCourse[] {
  const updated = loadCourses().map((c) => (c.id === id ? { ...c, ...patch } : c))
  saveCourses(updated)
  return updated
}

export function deleteCourse(id: string): GolfCourse[] {
  const updated = loadCourses().filter((c) => c.id !== id)
  saveCourses(updated)
  return updated
}

export function addTee(courseId: string, tee: CourseTee): GolfCourse[] {
  const updated = loadCourses().map((c) =>
    c.id === courseId ? { ...c, tees: [...c.tees, tee] } : c,
  )
  saveCourses(updated)
  return updated
}

export function updateTee(courseId: string, teeIndex: number, tee: CourseTee): GolfCourse[] {
  const updated = loadCourses().map((c) =>
    c.id === courseId
      ? { ...c, tees: c.tees.map((t, idx) => (idx === teeIndex ? tee : t)) }
      : c,
  )
  saveCourses(updated)
  return updated
}

export function deleteTee(courseId: string, teeIndex: number): GolfCourse[] {
  const updated = loadCourses().map((c) =>
    c.id === courseId ? { ...c, tees: c.tees.filter((_, idx) => idx !== teeIndex) } : c,
  )
  saveCourses(updated)
  return updated
}
