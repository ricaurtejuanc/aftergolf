import type { CourseTee } from '../data/courses'
import { SUPABASE_URL, supabase } from './supabaseClient'

export interface GolfCourseApiSearchResult {
  id: number
  name: string
  club: string | null
  address: string | null
}

export interface GolfCourseApiDetail {
  name: string
  location: string
  tees: CourseTee[]
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function callFunction<T>(query: string): Promise<T> {
  const headers = await authHeaders()
  const response = await fetch(`${SUPABASE_URL}/functions/v1/golf-course-api?${query}`, { headers })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error ?? 'Error al conectar con GolfCourseAPI')
  return data
}

export async function searchGolfCourses(query: string): Promise<GolfCourseApiSearchResult[]> {
  const data = await callFunction<{ courses: GolfCourseApiSearchResult[] }>(
    `action=search&q=${encodeURIComponent(query)}`,
  )
  return data.courses
}

export async function getGolfCourse(id: number): Promise<GolfCourseApiDetail> {
  return callFunction<GolfCourseApiDetail>(`action=get&id=${id}`)
}
