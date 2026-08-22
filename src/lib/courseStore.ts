import type { CourseTee, GolfCourse } from '../data/courses'
import type { GolfCourseApiDetail } from './golfCourseApi'
import { supabase } from './supabaseClient'

interface CourseRow {
  id: string
  name: string
  location: string
}

interface RecorridoRow {
  id: string
  course_id: string
  name: string
  position: number
}

interface TeeRow {
  id: string
  recorrido_id: string
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
  const [{ data: courseRows }, { data: recorridoRows }, { data: teeRows }] = await Promise.all([
    supabase.from('courses').select('*').order('name'),
    supabase.from('recorridos').select('*').order('position'),
    supabase.from('tees').select('*').order('position'),
  ])
  const courses = (courseRows ?? []) as CourseRow[]
  const recorridos = (recorridoRows ?? []) as RecorridoRow[]
  const tees = (teeRows ?? []) as TeeRow[]

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location,
    rounds: recorridos
      .filter((r) => r.course_id === c.id)
      .map((r) => ({
        id: r.id,
        name: r.name,
        tees: tees
          .filter((t) => t.recorrido_id === r.id)
          .map((t) => ({
            id: t.id,
            color: t.color as CourseTee['color'],
            gender: t.gender as CourseTee['gender'],
            cr: t.cr,
            slope: t.slope,
            par: t.par,
          })),
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

  const { data: recorridoRow, error: recorridoError } = await supabase
    .from('recorridos')
    .insert({ course_id: id, name: detail.name, position: 0 })
    .select('id')
    .single()
  if (recorridoError) throw recorridoError

  if (detail.tees.length > 0) {
    const { error: teesError } = await supabase.from('tees').insert(
      detail.tees.map((tee, position) => ({
        recorrido_id: (recorridoRow as { id: string }).id,
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

export async function addRecorrido(courseId: string, name: string): Promise<GolfCourse[]> {
  const { count } = await supabase
    .from('recorridos')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)
  const { error } = await supabase
    .from('recorridos')
    .insert({ course_id: courseId, name, position: count ?? 0 })
  if (error) throw error
  return loadCourses()
}

export async function updateRecorrido(recorridoId: string, name: string): Promise<GolfCourse[]> {
  const { error } = await supabase.from('recorridos').update({ name }).eq('id', recorridoId)
  if (error) throw error
  return loadCourses()
}

export async function deleteRecorrido(recorridoId: string): Promise<GolfCourse[]> {
  const { error } = await supabase.from('recorridos').delete().eq('id', recorridoId)
  if (error) throw error
  return loadCourses()
}

async function teeIdAtPosition(recorridoId: string, index: number): Promise<string | null> {
  const { data } = await supabase
    .from('tees')
    .select('id')
    .eq('recorrido_id', recorridoId)
    .order('position')
    .range(index, index)
  return data?.[0]?.id ?? null
}

export async function addTee(recorridoId: string, tee: CourseTee): Promise<GolfCourse[]> {
  const { count } = await supabase
    .from('tees')
    .select('id', { count: 'exact', head: true })
    .eq('recorrido_id', recorridoId)
  const { error } = await supabase.from('tees').insert({
    recorrido_id: recorridoId,
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
  recorridoId: string,
  teeIndex: number,
  tee: CourseTee,
): Promise<GolfCourse[]> {
  const teeId = await teeIdAtPosition(recorridoId, teeIndex)
  if (teeId) {
    const { error } = await supabase
      .from('tees')
      .update({ color: tee.color, gender: tee.gender, cr: tee.cr, slope: tee.slope, par: tee.par })
      .eq('id', teeId)
    if (error) throw error
  }
  return loadCourses()
}

export async function deleteTee(recorridoId: string, teeIndex: number): Promise<GolfCourse[]> {
  const teeId = await teeIdAtPosition(recorridoId, teeIndex)
  if (teeId) {
    const { error } = await supabase.from('tees').delete().eq('id', teeId)
    if (error) throw error
  }
  return loadCourses()
}
