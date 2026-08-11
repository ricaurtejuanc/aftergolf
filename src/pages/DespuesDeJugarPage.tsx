import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { InfoTooltip } from '../components/InfoTooltip'
import { StatCard } from '../components/StatCard'
import type { CourseTee } from '../data/courses'
import {
  calculateCourseHandicap,
  calculateRoundResult,
  GROSS_STABLEFORD_EXPLANATION,
} from '../lib/handicap'
import { loadHandicapIndex, saveRound, type SavedRound } from '../lib/storage'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function DespuesDeJugarPage() {
  const [handicapIndexInput, setHandicapIndexInput] = useState<string>(() =>
    String(loadHandicapIndex() ?? 12.0),
  )
  const handicapIndex = Number(handicapIndexInput) || 0
  const [courseId, setCourseId] = useState('')
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee | null>(null)
  const [courseName, setCourseName] = useState('')
  const [courseLocation, setCourseLocation] = useState('')
  const [grossScoreInput, setGrossScoreInput] = useState('90')
  const grossScore = Number(grossScoreInput) || 0
  const [datePlayed, setDatePlayed] = useState(today())
  const [saved, setSaved] = useState(false)

  const { courseHandicap } = tee
    ? calculateCourseHandicap({
        handicapIndex,
        slopeRating: tee.slope,
        courseRating: tee.cr,
        par: tee.par,
      })
    : { courseHandicap: 0 }

  const result = tee
    ? calculateRoundResult({
        courseHandicap,
        grossScore,
        slopeRating: tee.slope,
        courseRating: tee.cr,
        par: tee.par,
      })
    : null

  function handleSave() {
    if (!tee) return
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
      strokesReceived: result!.strokesReceived,
      netScore: result!.netScore,
      stablefordPoints: result!.stablefordPoints,
      differential: result!.differential,
      datePlayed,
    }
    saveRound(round)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Después de Jugar</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Introduce tu resultado bruto para obtener strokes recibidos, resultado
          neto, puntos Stableford y el Score Differential de la ronda.
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">
            Handicap Index (HI)
          </label>
          <input
            type="number"
            step="0.1"
            value={handicapIndexInput}
            onChange={(e) => setHandicapIndexInput(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">Fecha</label>
          <input
            type="date"
            value={datePlayed}
            onChange={(e) => setDatePlayed(e.target.value)}
            className="w-full max-w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
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
          <label className="mb-1 flex items-center text-sm font-medium text-fairway-800">
            Resultado Bruto Stableford
            <InfoTooltip text={GROSS_STABLEFORD_EXPLANATION} />
          </label>
          <input
            type="number"
            value={grossScoreInput}
            onChange={(e) => setGrossScoreInput(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
        </div>
      </div>

      {!tee || !result ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          Selecciona un campo y tee para ver tu resultado.
        </div>
      ) : (
        <>
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
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
          >
            {saved ? 'Ronda guardada ✓' : 'Guardar ronda en mi historial'}
          </button>

          <Link
            to="/historial"
            className="block text-center text-sm text-fairway-600 underline-offset-2 hover:underline"
          >
            Ver historial de rondas →
          </Link>
        </>
      )}
    </div>
  )
}
