import { useEffect, useMemo, useState } from 'react'
import type { CourseTee, GolfCourse } from '../data/courses'
import { loadCourses } from '../lib/courseStore'
import {
  getGolfCourse,
  searchGolfCourses,
  type GolfCourseApiSearchResult,
} from '../lib/golfCourseApi'

const TEE_LABEL: Record<CourseTee['color'], string> = {
  blanco: 'Blanco',
  amarillo: 'Amarillo',
  azul: 'Azul',
  rojo: 'Rojo',
  negro: 'Negro',
  naranja: 'Naranja',
}

const TEE_DOT: Record<CourseTee['color'], string> = {
  blanco: 'border border-fairway-400 bg-white',
  amarillo: 'bg-yellow-400',
  azul: 'bg-blue-500',
  rojo: 'bg-red-500',
  negro: 'bg-fairway-950',
  naranja: 'bg-orange-500',
}

function GolfCourseApiFallback({
  onSelect,
  onCancel,
}: {
  onSelect: (course: GolfCourse) => void
  onCancel: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GolfCourseApiSearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      setResults(await searchGolfCourses(query.trim()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar en GolfCourseAPI')
    } finally {
      setSearching(false)
    }
  }

  async function handlePick(id: string) {
    setLoadingId(id)
    setError(null)
    try {
      const detail = await getGolfCourse(id)
      if (detail.tees.length === 0) {
        setError('Ese campo no tiene datos de tees disponibles.')
        return
      }
      onSelect({ id: `api:${id}`, name: detail.name, location: detail.location, tees: detail.tees })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el campo')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-cream-300 bg-cream-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-fairway-700">Buscar en GolfCourseAPI</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-fairway-500 underline-offset-2 hover:underline"
        >
          Cancelar
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Nombre del campo..."
          className="flex-1 rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
        >
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {results &&
        (results.length === 0 ? (
          <p className="text-xs text-fairway-500">Sin resultados.</p>
        ) : (
          <div className="space-y-1">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handlePick(r.id)}
                disabled={loadingId === r.id}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-fairway-900 transition hover:bg-white disabled:opacity-60"
              >
                <span className="font-medium">{r.name}</span>
                {r.address && <span className="text-fairway-500"> — {r.address}</span>}
                {loadingId === r.id && <span className="text-fairway-500"> (cargando...)</span>}
              </button>
            ))}
          </div>
        ))}
    </div>
  )
}

interface Props {
  courseId: string
  teeIndex: number
  onChange: (
    courseId: string,
    teeIndex: number,
    tee: CourseTee | null,
    courseName: string,
    courseLocation: string,
  ) => void
}

export function CourseTeeSelect({ courseId, teeIndex, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [apiCourse, setApiCourse] = useState<GolfCourse | null>(null)
  const [showApiSearch, setShowApiSearch] = useState(false)
  const [teeExpanded, setTeeExpanded] = useState(true)

  useEffect(() => {
    loadCourses().then(setCourses)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query, courses])

  // Local courses take priority; falls back to a course picked from
  // GolfCourseAPI (identified by its "api:" id prefix) when not found
  // locally — the round is saved with copied values either way, so it
  // doesn't need to live in the local courses table.
  const course = courses.find((c) => c.id === courseId) ?? (apiCourse?.id === courseId ? apiCourse : undefined)

  // Re-expand the tee picker whenever a different course is chosen, so
  // there's always a chance to review/pick a tee for it.
  useEffect(() => {
    setTeeExpanded(true)
  }, [course?.id])

  if (!course) {
    return (
      <div>
        <label className="block text-sm font-medium text-fairway-800 mb-1">
          Campo de golf
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar campo o ubicación..."
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 placeholder-fairway-400 focus:border-fairway-500 focus:outline-none"
        />
        {filtered.length > 0 && (
          <div className="mt-2 space-y-1 rounded-lg border border-cream-300 bg-white p-1 shadow-sm">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setQuery('')
                  onChange(c.id, 0, c.tees[0], c.name, c.location)
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-fairway-900 transition hover:bg-cream-100"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-fairway-500"> — {c.location}</span>
              </button>
            ))}
          </div>
        )}

        {showApiSearch ? (
          <GolfCourseApiFallback
            onCancel={() => setShowApiSearch(false)}
            onSelect={(golfCourse) => {
              setApiCourse(golfCourse)
              setShowApiSearch(false)
              onChange(golfCourse.id, 0, golfCourse.tees[0], golfCourse.name, golfCourse.location)
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowApiSearch(true)}
            className="mt-2 text-xs text-fairway-600 underline-offset-2 hover:underline"
          >
            ¿No está en la lista? Buscar en GolfCourseAPI
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-fairway-800 mb-1">
          Campo de golf
        </label>
        <div className="flex items-center justify-between rounded-lg border border-cream-300 bg-cream-100 px-3 py-2">
          <div>
            <div className="text-sm font-medium text-fairway-900">{course.name}</div>
            <div className="text-xs text-fairway-500">{course.location}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setApiCourse(null)
              onChange('', 0, null, '', '')
            }}
            className="shrink-0 rounded-lg border border-cream-300 bg-white px-2.5 py-1 text-xs font-medium text-fairway-700 transition hover:border-fairway-400"
          >
            Cambiar
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-fairway-800">Tee de salida</label>
          {!teeExpanded && (
            <button
              type="button"
              onClick={() => setTeeExpanded(true)}
              className="text-xs text-fairway-600 underline-offset-2 hover:underline"
            >
              Cambiar tee
            </button>
          )}
        </div>

        {teeExpanded ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {course.tees.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(course.id, idx, t, course.name, course.location)
                  setTeeExpanded(false)
                }}
                className={`rounded-lg border p-2.5 text-left text-xs transition ${
                  idx === teeIndex
                    ? 'border-fairway-700 bg-fairway-800 text-cream-50'
                    : 'border-cream-300 bg-white text-fairway-800 hover:border-fairway-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TEE_DOT[t.color]}`} />
                  {TEE_LABEL[t.color]}
                </div>
                <div className={idx === teeIndex ? 'mt-1 text-cream-100' : 'mt-1 text-fairway-500'}>
                  CR {t.cr} · Slope {t.slope} · Par {t.par}
                </div>
              </button>
            ))}
          </div>
        ) : (
          course.tees[teeIndex] && (
            <div className="flex items-center gap-2 rounded-lg border border-fairway-700 bg-fairway-800 p-2.5 text-xs text-cream-50">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TEE_DOT[course.tees[teeIndex].color]}`} />
              <div>
                <div className="font-medium">{TEE_LABEL[course.tees[teeIndex].color]}</div>
                <div className="mt-0.5 text-cream-100">
                  CR {course.tees[teeIndex].cr} · Slope {course.tees[teeIndex].slope} · Par{' '}
                  {course.tees[teeIndex].par}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export { TEE_LABEL }
