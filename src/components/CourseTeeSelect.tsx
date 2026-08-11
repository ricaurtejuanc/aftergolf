import { useMemo, useState } from 'react'
import { COURSES, type CourseTee } from '../data/courses'

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return COURSES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query])

  const course = COURSES.find((c) => c.id === courseId)

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
            onClick={() => onChange('', 0, null, '', '')}
            className="shrink-0 rounded-lg border border-cream-300 bg-white px-2.5 py-1 text-xs font-medium text-fairway-700 transition hover:border-fairway-400"
          >
            Cambiar
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-fairway-800 mb-1">
          Tee de salida
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {course.tees.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(course.id, idx, t, course.name, course.location)}
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
      </div>
    </div>
  )
}

export { TEE_LABEL }
