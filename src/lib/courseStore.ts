import type { CourseTee, GolfCourse } from '../data/courses'
import type { GolfCourseApiDetail } from './golfCourseApi'
import { supabase } from './supabaseClient'

interface CourseRow {
  id: string
  name: string
  location: string
}

interface TeeRow {
  id: string
  course_id: string
  color: string
  gender: string
  cr: number
  slope: number
  par: number
  position: number
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

export async function loadCourses(): Promise<GolfCourse[]> {
  const [{ data: courseRows }, { data: teeRows }] = await Promise.all([
    supabase.from('courses').select('*').order('name'),
    supabase.from('tees').select('*').order('position'),
  ])
  const courses = (courseRows ?? []) as CourseRow[]
  const tees = (teeRows ?? []) as TeeRow[]

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location,
    tees: tees
      .filter((t) => t.course_id === c.id)
      .map((t) => ({
        color: t.color as CourseTee['color'],
        gender: t.gender as CourseTee['gender'],
        cr: t.cr,
        slope: t.slope,
        par: t.par,
      })),
  }))
}

async function uniqueCourseId(name: string): Promise<string> {
  const baseId = slugify(name)
  let id = baseId
  let n = 2
  for (;;) {
    const { data } = await supabase.from('courses').select('id').eq('id', id).maybeSingle()
    if (!data) return id
    id = `${baseId}-${n++}`
  }
}

export async function addCourse(input: { name: string; location: string }): Promise<GolfCourse[]> {
  const id = await uniqueCourseId(input.name)
  const { error } = await supabase
    .from('courses')
    .insert({ id, name: input.name, location: input.location })
  if (error) throw error
  return loadCourses()
}

export async function importGolfCourse(detail: GolfCourseApiDetail): Promise<GolfCourse[]> {
  const id = await uniqueCourseId(detail.name)
  const { error: courseError } = await supabase
    .from('courses')
    .insert({ id, name: detail.name, location: detail.location })
  if (courseError) throw courseError

  if (detail.tees.length > 0) {
    const { error: teesError } = await supabase.from('tees').insert(
      detail.tees.map((tee, position) => ({
        course_id: id,
        color: tee.color,
        gender: tee.gender,
        cr: tee.cr,
        slope: tee.slope,
        par: tee.par,
        position,
      })),
    )
    if (teesError) throw teesError
  }

  return loadCourses()
}

export async function updateCourse(
  id: string,
  patch: { name: string; location: string },
): Promise<GolfCourse[]> {
  const { error } = await supabase
    .from('courses')
    .update({ name: patch.name, location: patch.location })
    .eq('id', id)
  if (error) throw error
  return loadCourses()
}

export async function deleteCourse(id: string): Promise<GolfCourse[]> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
  return loadCourses()
}

async function teeIdAtPosition(courseId: string, index: number): Promise<string | null> {
  const { data } = await supabase
    .from('tees')
    .select('id')
    .eq('course_id', courseId)
    .order('position')
    .range(index, index)
  return data?.[0]?.id ?? null
}

export async function addTee(courseId: string, tee: CourseTee): Promise<GolfCourse[]> {
  const { count } = await supabase
    .from('tees')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)
  const { error } = await supabase.from('tees').insert({
    course_id: courseId,
    color: tee.color,
    gender: tee.gender,
    cr: tee.cr,
    slope: tee.slope,
    par: tee.par,
    position: count ?? 0,
  })
  if (error) throw error
  return loadCourses()
}

export async function updateTee(
  courseId: string,
  teeIndex: number,
  tee: CourseTee,
): Promise<GolfCourse[]> {
  const teeId = await teeIdAtPosition(courseId, teeIndex)
  if (teeId) {
    const { error } = await supabase
      .from('tees')
      .update({ color: tee.color, gender: tee.gender, cr: tee.cr, slope: tee.slope, par: tee.par })
      .eq('id', teeId)
    if (error) throw error
  }
  return loadCourses()
}

export async function deleteTee(courseId: string, teeIndex: number): Promise<GolfCourse[]> {
  const teeId = await teeIdAtPosition(courseId, teeIndex)
  if (teeId) {
    const { error } = await supabase.from('tees').delete().eq('id', teeId)
    if (error) throw error
  }
  return loadCourses()
}
