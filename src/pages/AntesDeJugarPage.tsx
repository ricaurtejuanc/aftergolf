import { useEffect, useState } from 'react'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { StatCard } from '../components/StatCard'
import type { CourseTee } from '../data/courses'
import { COURSES } from '../data/courses'
import { calculateCourseHandicap, HANDICAP_ALLOWANCES } from '../lib/handicap'
import { loadHandicapIndex, saveHandicapIndex } from '../lib/storage'

const HANDICAP_LOOKUP_URL = 'https://www.golfdirecto.com/handicap/search'

export function AntesDeJugarPage() {
  const [handicapIndex, setHandicapIndex] = useState<number>(() => loadHandicapIndex() ?? 12.0)
  const [courseId, setCourseId] = useState(COURSES[0].id)
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee>(COURSES[0].tees[0])
  const [allowance, setAllowance] = useState(1)

  useEffect(() => {
    saveHandicapIndex(handicapIndex)
  }, [handicapIndex])

  const { exact, courseHandicap } = calculateCourseHandicap({
    handicapIndex,
    slopeRating: tee.slope,
    courseRating: tee.cr,
    par: tee.par,
    allowance,
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Antes de Jugar</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Consulta tu Handicap Index oficial y calcula tu handicap de juego
          para el campo y tee que vas a jugar.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-fairway-900">
            1. Consulta tu Handicap Federado
          </h2>
          <a
            href={HANDICAP_LOOKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium text-fairway-800 transition hover:border-fairway-400"
          >
            Abrir en otra pestaña ↗
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
          <iframe
            src={HANDICAP_LOOKUP_URL}
            title="Consulta de Handicap Federado"
            className="h-[600px] w-full"
          />
        </div>

        <p className="text-xs text-fairway-500">
          Si el buscador no carga aquí dentro, usa "Abrir en otra pestaña".
          Cuando tengas tu Handicap Index, escríbelo en el campo de abajo
          para usarlo en el cálculo.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-fairway-900">
          2. Calcula tu handicap de juego
        </h2>

        <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-5 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-fairway-800 mb-1">
              Tu Handicap Index (HI)
            </label>
            <input
              type="number"
              step="0.1"
              value={handicapIndex}
              onChange={(e) => setHandicapIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
          </div>

          <CourseTeeSelect
            courseId={courseId}
            teeIndex={teeIndex}
            onChange={(cId, tIdx, t) => {
              setCourseId(cId)
              setTeeIndex(tIdx)
              setTee(t)
            }}
          />

          <div>
            <label className="block text-sm font-medium text-fairway-800 mb-1">
              Modalidad / % de handicap
            </label>
            <select
              value={allowance}
              onChange={(e) => setAllowance(Number(e.target.value))}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            >
              {HANDICAP_ALLOWANCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Handicap de juego" value={courseHandicap} accent />
          <StatCard label="Valor exacto" value={exact.toFixed(2)} />
        </div>

        <div className="rounded-xl border border-cream-300 bg-cream-100 p-4 text-sm text-fairway-700">
          <p className="font-mono text-xs text-fairway-500">
            HC = HI x (Slope / 113) + (CR - Par)
          </p>
          <p className="mt-1">
            {handicapIndex} x ({tee.slope} / 113) + ({tee.cr} - {tee.par})
            {allowance !== 1 ? ` x ${allowance}` : ''} = {exact.toFixed(2)} → {courseHandicap}
          </p>
        </div>
      </div>
    </div>
  )
}
