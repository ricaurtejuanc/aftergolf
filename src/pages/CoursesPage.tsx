import { useMemo, useState } from 'react'
import { TEE_LABEL } from '../components/CourseTeeSelect'
import { COURSES } from '../data/courses'

export function CoursesPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COURSES
    return COURSES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Campos de golf</h1>
        <p className="mt-1 text-sm text-fairway-600">
          {COURSES.length} campos españoles con sus tees, Course Rating y Slope.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar campo o ubicación..."
        className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 placeholder-fairway-400 focus:border-fairway-500 focus:outline-none"
      />

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm">
            <div className="font-medium text-fairway-900">{c.name}</div>
            <div className="text-xs text-fairway-500">{c.location}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.tees.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-cream-300 bg-cream-100 px-2.5 py-1 text-xs text-fairway-700"
                >
                  {TEE_LABEL[t.color]} · CR {t.cr} · Slope {t.slope} · Par {t.par}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
