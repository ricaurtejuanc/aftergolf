import { useEffect, useState } from 'react'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { InfoTooltip } from '../components/InfoTooltip'
import { StatCard } from '../components/StatCard'
import type { CourseTee } from '../data/courses'
import {
  calculateCourseHandicap,
  calculateRoundResult,
  GROSS_STABLEFORD_EXPLANATION,
  HANDICAP_ALLOWANCES,
} from '../lib/handicap'
import { loadHandicapIndex, saveHandicapIndex } from '../lib/storage'

export function AntesDeJugarPage() {
  const [handicapIndexInput, setHandicapIndexInput] = useState<string>(() =>
    String(loadHandicapIndex() ?? 12.0),
  )
  const handicapIndex = Number(handicapIndexInput) || 0
  const [courseId, setCourseId] = useState('')
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee | null>(null)
  const [allowance, setAllowance] = useState(1)
  const [showRoundCalc, setShowRoundCalc] = useState(false)
  const [grossScoreInput, setGrossScoreInput] = useState('90')
  const grossScore = Number(grossScoreInput) || 0

  useEffect(() => {
    saveHandicapIndex(handicapIndex)
  }, [handicapIndex])

  const { exact, courseHandicap } = tee
    ? calculateCourseHandicap({
        handicapIndex,
        slopeRating: tee.slope,
        courseRating: tee.cr,
        par: tee.par,
        allowance,
      })
    : { exact: 0, courseHandicap: 0 }

  const roundResult = tee
    ? calculateRoundResult({
        courseHandicap,
        grossScore,
        slopeRating: tee.slope,
        courseRating: tee.cr,
        par: tee.par,
      })
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Handicap de Juego</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Calcula tu Course Handicap para el tee que vas a jugar, a partir de tu
          Handicap Index (WHS/RFEG).
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">
            Tu Handicap Index (HI)
          </label>
          <input
            type="number"
            step="0.1"
            value={handicapIndexInput}
            onChange={(e) => setHandicapIndexInput(e.target.value)}
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
            setShowRoundCalc(false)
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

      {!tee ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          Selecciona un campo y tee para calcular tu handicap de juego.
        </div>
      ) : (
        <>
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

          {!showRoundCalc ? (
            <button
              onClick={() => setShowRoundCalc(true)}
              className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
            >
              Calcular handicap jugado y puntos Stableford
            </button>
          ) : (
            roundResult && (
              <div className="space-y-4 border-t border-cream-300 pt-6">
                <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
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

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Golpes recibidos" value={roundResult.strokesReceived} />
                  <StatCard label="Resultado neto" value={roundResult.netScore} accent />
                  <StatCard label="Puntos Stableford" value={roundResult.stablefordPoints} />
                  <StatCard
                    label="Handicap jugado"
                    value={roundResult.differential.toFixed(1)}
                    accent
                  />
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
