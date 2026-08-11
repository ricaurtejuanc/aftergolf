import { useEffect, useState } from 'react'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { StatCard } from '../components/StatCard'
import type { CourseTee } from '../data/courses'
import { COURSES } from '../data/courses'
import { calculateCourseHandicap, HANDICAP_ALLOWANCES } from '../lib/handicap'
import { loadHandicapIndex, saveHandicapIndex } from '../lib/storage'

export function CourseHandicapPage() {
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Handicap de Juego</h1>
        <p className="mt-1 text-sm text-fairway-300">
          Calcula tu Course Handicap para el tee que vas a jugar, a partir de tu
          Handicap Index (WHS/RFEG).
        </p>
      </div>

      <div className="rounded-2xl border border-fairway-800 bg-fairway-900/40 p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-fairway-100 mb-1">
            Tu Handicap Index (HI)
          </label>
          <input
            type="number"
            step="0.1"
            value={handicapIndex}
            onChange={(e) => setHandicapIndex(Number(e.target.value))}
            className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
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
          <label className="block text-sm font-medium text-fairway-100 mb-1">
            Modalidad / % de handicap
          </label>
          <select
            value={allowance}
            onChange={(e) => setAllowance(Number(e.target.value))}
            className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
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

      <div className="rounded-xl border border-fairway-800 bg-fairway-900/20 p-4 text-sm text-fairway-300">
        <p className="font-mono text-xs text-fairway-400">
          HC = HI x (Slope / 113) + (CR - Par)
        </p>
        <p className="mt-1">
          {handicapIndex} x ({tee.slope} / 113) + ({tee.cr} - {tee.par})
          {allowance !== 1 ? ` x ${allowance}` : ''} = {exact.toFixed(2)} → {courseHandicap}
        </p>
      </div>
    </div>
  )
}
