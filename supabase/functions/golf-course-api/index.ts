const GOLF_COURSE_API_KEY = Deno.env.get('GOLF_COURSE_API_KEY')
const API_BASE = 'https://api.golfcourseapi.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Any logged-in user may call this (read-only, no writes happen here) — the
// platform already verifies the JWT since verify_jwt is on for this
// function, so we only need to confirm one was actually presented rather
// than checking a specific identity.
function isLoggedIn(req: Request): boolean {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const payloadSegment = token.split('.')[1]
  if (!payloadSegment) return false
  try {
    const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.sub === 'string'
  } catch {
    return false
  }
}

async function golfApiFetch(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${GOLF_COURSE_API_KEY}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error ?? `GolfCourseAPI respondió ${res.status}`)
  }
  return data
}

const COLOR_KEYWORDS: [string, string][] = [
  ['white', 'blanco'],
  ['blanc', 'blanco'],
  ['yellow', 'amarillo'],
  ['gold', 'amarillo'],
  ['blue', 'azul'],
  ['azul', 'azul'],
  ['red', 'rojo'],
  ['rojo', 'rojo'],
  ['black', 'negro'],
  ['negro', 'negro'],
  ['orange', 'naranja'],
  ['naranja', 'naranja'],
]

// GolfCourseAPI gives a free-text tee name ("Championship", "Blue",
// "Blue/White Combo", ...) instead of one of our fixed marker colors —
// guess from common English/Spanish color words. Picks whichever known
// color word appears EARLIEST in the name rather than checking our lookup
// table in a fixed order — otherwise "Blue/White Combo" always reads as
// "blanco" just because "white" happens to be first in the table, even
// though "blue" is the actual (and earlier) color in the name. Falls back
// to "blanco" only when nothing recognizable is found (e.g. "Brown",
// "Championship" — our fixed palette has no brown/gold-alternate option;
// the admin can fix it after import, same as the Printful color guesser).
function guessTeeColor(teeName: string): string {
  const lower = teeName.toLowerCase()
  let bestIndex = Infinity
  let bestColor: string | null = null
  for (const [keyword, color] of COLOR_KEYWORDS) {
    const idx = lower.indexOf(keyword)
    if (idx !== -1 && idx < bestIndex) {
      bestIndex = idx
      bestColor = color
    }
  }
  return bestColor ?? 'blanco'
}

interface ApiTee {
  tee_name?: string
  course_rating?: number
  slope_rating?: number
  par_total?: number
}

interface ApiCourseDetail {
  club_name?: string
  course_name?: string
  location?: { address?: string; city?: string; state?: string; country?: string }
  tees?: { male?: ApiTee[]; female?: ApiTee[] }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!GOLF_COURSE_API_KEY) {
    console.error('GOLF_COURSE_API_KEY secret is not set')
    return jsonResponse({ error: 'GolfCourseAPI no está configurado' }, 500)
  }

  if (!isLoggedIn(req)) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    if (action === 'search') {
      const q = url.searchParams.get('q')
      if (!q?.trim()) return jsonResponse({ error: 'Falta el texto de búsqueda' }, 400)

      const data = (await golfApiFetch(`/v1/search?search_query=${encodeURIComponent(q)}`)) as {
        courses?: { id: string; course_name?: string; club_name?: string; location?: { address?: string } }[]
      }
      return jsonResponse({
        courses: (data.courses ?? []).map((c) => ({
          id: c.id,
          name: c.course_name || c.club_name || 'Campo sin nombre',
          club: c.club_name ?? null,
          address: c.location?.address ?? null,
        })),
      })
    }

    if (action === 'get') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResponse({ error: 'Falta id' }, 400)

      const data = (await golfApiFetch(`/v1/courses/${id}`)) as { course?: ApiCourseDetail } & ApiCourseDetail
      const course = data.course ?? data

      const tees = (
        [
          ...(course.tees?.male ?? []).map((t) => ({ ...t, gender: 'hombres' })),
          ...(course.tees?.female ?? []).map((t) => ({ ...t, gender: 'mujeres' })),
        ] as (ApiTee & { gender: string })[]
      )
        .filter((t) => t.course_rating != null && t.slope_rating != null && t.par_total != null)
        .map((t) => ({
          color: guessTeeColor(t.tee_name ?? ''),
          gender: t.gender,
          cr: t.course_rating!,
          slope: t.slope_rating!,
          par: t.par_total!,
        }))

      const location = course.location
      return jsonResponse({
        name: course.course_name || course.club_name || 'Campo sin nombre',
        location: [location?.address, location?.city, location?.country].filter(Boolean).join(', '),
        tees,
      })
    }

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('GolfCourseAPI error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de GolfCourseAPI' }, 502)
  }
})
