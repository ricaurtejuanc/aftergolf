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
        <h1 className="text-2xl font-semibold text-white">Campos de golf</h1>
        <p className="mt-1 text-sm text-fairway-300">
          {COURSES.length} campos españoles con sus tees, Course Rating y Slope.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar campo o ubicación..."
        className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white placeholder-fairway-400 focus:border-fairway-400 focus:outline-none"
      />

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-xl border border-fairway-800 bg-fairway-900/40 p-4">
            <div className="font-medium text-white">{c.name}</div>
            <div className="text-xs text-fairway-400">{c.location}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.tees.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-fairway-700 px-2.5 py-1 text-xs text-fairway-200"
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
