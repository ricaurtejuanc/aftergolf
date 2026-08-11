import { useState } from 'react'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { StatCard } from '../components/StatCard'
import type { CourseTee } from '../data/courses'
import { COURSES } from '../data/courses'
import { calculateCourseHandicap, calculateRoundResult } from '../lib/handicap'
import { loadHandicapIndex, saveRound, type SavedRound } from '../lib/storage'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function PostRoundPage() {
  const [handicapIndex, setHandicapIndex] = useState<number>(() => loadHandicapIndex() ?? 12.0)
  const [courseId, setCourseId] = useState(COURSES[0].id)
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee>(COURSES[0].tees[0])
  const [courseName, setCourseName] = useState(COURSES[0].name)
  const [courseLocation, setCourseLocation] = useState(COURSES[0].location)
  const [grossScore, setGrossScore] = useState<number>(90)
  const [datePlayed, setDatePlayed] = useState(today())
  const [saved, setSaved] = useState(false)

  const { courseHandicap } = calculateCourseHandicap({
    handicapIndex,
    slopeRating: tee.slope,
    courseRating: tee.cr,
    par: tee.par,
  })

  const result = calculateRoundResult({
    courseHandicap,
    grossScore,
    slopeRating: tee.slope,
    courseRating: tee.cr,
    par: tee.par,
  })

  function handleSave() {
    const round: SavedRound = {
      id: crypto.randomUUID(),
      courseName,
      courseLocation,
      teeColor: tee.color,
      teeGender: tee.gender,
      courseRating: tee.cr,
      slopeRating: tee.slope,
      par: tee.par,
      handicapIndex,
      courseHandicap,
      grossScore,
      strokesReceived: result.strokesReceived,
      netScore: result.netScore,
      stablefordPoints: result.stablefordPoints,
      differential: result.differential,
      datePlayed,
    }
    saveRound(round)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Handicap Jugado (Post-Ronda)</h1>
        <p className="mt-1 text-sm text-fairway-300">
          Introduce tu resultado bruto para obtener strokes recibidos, resultado
          neto, puntos Stableford y el Score Differential de la ronda.
        </p>
      </div>

      <div className="rounded-2xl border border-fairway-800 bg-fairway-900/40 p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-fairway-100 mb-1">
              Handicap Index (HI)
            </label>
            <input
              type="number"
              step="0.1"
              value={handicapIndex}
              onChange={(e) => setHandicapIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fairway-100 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={datePlayed}
              onChange={(e) => setDatePlayed(e.target.value)}
              className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
            />
          </div>
        </div>

        <CourseTeeSelect
          courseId={courseId}
          teeIndex={teeIndex}
          onChange={(cId, tIdx, t, name, location) => {
            setCourseId(cId)
            setTeeIndex(tIdx)
            setTee(t)
            setCourseName(name)
            setCourseLocation(location)
          }}
        />

        <div>
          <label className="block text-sm font-medium text-fairway-100 mb-1">
            Resultado bruto (golpes totales)
          </label>
          <input
            type="number"
            value={grossScore}
            onChange={(e) => setGrossScore(Number(e.target.value))}
            className="w-full rounded-lg border border-fairway-700 bg-fairway-900/60 px-3 py-2 text-sm text-white focus:border-fairway-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Hcp de juego" value={courseHandicap} />
        <StatCard label="Golpes recibidos" value={result.strokesReceived} />
        <StatCard label="Resultado neto" value={result.netScore} accent />
        <StatCard label="Puntos Stableford" value={result.stablefordPoints} />
      </div>

      <StatCard
        label="Score Differential (handicap jugado)"
        value={result.differential.toFixed(1)}
        hint="(113 / Slope) x (Bruto - Course Rating)"
        accent
      />

      <button
        onClick={handleSave}
        className="w-full rounded-lg bg-fairway-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-400"
      >
        {saved ? 'Ronda guardada ✓' : 'Guardar ronda en mi historial'}
      </button>
    </div>
  )
}
