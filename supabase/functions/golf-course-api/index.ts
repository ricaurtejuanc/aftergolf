const GOLF_COURSE_API_KEY = Deno.env.get('GOLF_COURSE_API_KEY')
const ADMIN_EMAIL = 'ricaurtejuanc@gmail.com'
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

// Only the site admin may call this — decode the caller's Supabase JWT
// (already verified by the platform since verify_jwt is on for this
// function) and check the email claim rather than trusting anything client
// side.
function callerEmail(req: Request): string | null {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const payloadSegment = token.split('.')[1]
  if (!payloadSegment) return null
  try {
    const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.email === 'string' ? payload.email : null
  } catch {
    return null
  }
}

async function golfApiFetch(path: string) {
  // GolfCourseAPI uses a non-standard "Key" auth scheme (not "Bearer").
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Key ${GOLF_COURSE_API_KEY}` },
  })
  const data = await res.json()
  // Temporary: log the raw upstream response while diagnosing why searches
  // come back empty — the exact response shape wasn't verified against
  // official docs (network access to them was blocked in the build session).
  console.log(`GolfCourseAPI ${path} -> ${res.status}`, JSON.stringify(data))
  if (!res.ok) {
    throw new Error(data?.message ?? `GolfCourseAPI respondió ${res.status}`)
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

// GolfCourseAPI gives a free-text tee name ("Championship", "Blue", ...)
// instead of one of our fixed marker colors — guess from common English/
// Spanish color words, defaulting to "blanco" when nothing matches (the
// admin can fix it after import, same as the Printful color guesser).
function guessTeeColor(teeName: string): string {
  const lower = teeName.toLowerCase()
  for (const [keyword, color] of COLOR_KEYWORDS) {
    if (lower.includes(keyword)) return color
  }
  return 'blanco'
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

  if (callerEmail(req) !== ADMIN_EMAIL) {
    return jsonResponse({ error: 'No autorizado' }, 403)
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    if (action === 'search') {
      const q = url.searchParams.get('q')
      if (!q?.trim()) return jsonResponse({ error: 'Falta el texto de búsqueda' }, 400)

      const data = (await golfApiFetch(`/v1/search?search_query=${encodeURIComponent(q)}`)) as {
        courses?: { id: number; course_name?: string; club_name?: string; location?: { address?: string } }[]
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
