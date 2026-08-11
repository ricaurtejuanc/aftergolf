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

interface Props {
  courseId: string
  teeIndex: number
  onChange: (courseId: string, teeIndex: number, tee: CourseTee, courseName: string, courseLocation: string) => void
}

export function CourseTeeSelect({ courseId, teeIndex, onChange }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COURSES
    return COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    )
  }, [query])

  const course = COURSES.find((c) => c.id === courseId)

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-fairway-100 mb-1">
          Campo de golf
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar campo o ubicación..."
          className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white placeholder-fairway-400 focus:border-fairway-400 focus:outline-none"
        />
        <select
          value={courseId}
          onChange={(e) => {
            const c = COURSES.find((x) => x.id === e.target.value)
            if (!c) return
            onChange(c.id, 0, c.tees[0], c.name, c.location)
          }}
          className="mt-2 w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
        >
          <option value="" disabled>
            Selecciona un campo
          </option>
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.location}
            </option>
          ))}
        </select>
      </div>

      {course && (
        <div>
          <label className="block text-sm font-medium text-fairway-100 mb-1">
            Tee de salida
          </label>
          <select
            value={teeIndex}
            onChange={(e) => {
              const idx = Number(e.target.value)
              onChange(course.id, idx, course.tees[idx], course.name, course.location)
            }}
            className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
          >
            {course.tees.map((t, idx) => (
              <option key={idx} value={idx}>
                {TEE_LABEL[t.color]} ({t.gender}) — CR {t.cr} / Slope {t.slope} / Par {t.par}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export { TEE_LABEL }
