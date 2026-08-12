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

const MAX_PLAYERS = 4

export function AntesDeJugarPage() {
  const [numPlayers, setNumPlayers] = useState(1)
  const [playerInputs, setPlayerInputs] = useState<string[]>(() => [
    String(loadHandicapIndex() ?? 12.0),
  ])
  const [courseId, setCourseId] = useState('')
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee | null>(null)
  const [allowance, setAllowance] = useState(1)
  const [showRoundCalc, setShowRoundCalc] = useState(false)
  const [showDistribution, setShowDistribution] = useState(false)
  const [grossScoreInput, setGrossScoreInput] = useState('90')
  const grossScore = Number(grossScoreInput) || 0

  const handicapIndex = Number(playerInputs[0]) || 0

  useEffect(() => {
    saveHandicapIndex(handicapIndex)
  }, [handicapIndex])

  function handleNumPlayersChange(n: number) {
    setNumPlayers(n)
    setPlayerInputs((prev) => {
      if (n === prev.length) return prev
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill('12')]
      return prev.slice(0, n)
    })
    setShowDistribution(false)
  }

  function updatePlayerInput(idx: number, value: string) {
    setPlayerInputs((prev) => prev.map((v, i) => (i === idx ? value : v)))
    setShowDistribution(false)
  }

  const playerResults = playerInputs.map((input) => {
    const hi = Number(input) || 0
    return tee
      ? calculateCourseHandicap({
          handicapIndex: hi,
          slopeRating: tee.slope,
          courseRating: tee.cr,
          par: tee.par,
          allowance,
        })
      : { exact: 0, courseHandicap: 0 }
  })

  const { exact, courseHandicap } = playerResults[0]

  const minCourseHandicap = Math.min(...playerResults.map((r) => r.courseHandicap))
  const strokesGiven = playerResults.map((r) => r.courseHandicap - minCourseHandicap)

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
            Número de jugadores
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleNumPlayersChange(n)}
                className={`rounded-lg border py-2 text-sm font-medium transition ${
                  numPlayers === n
                    ? 'border-fairway-700 bg-fairway-800 text-cream-50'
                    : 'border-cream-300 bg-white text-fairway-800 hover:border-fairway-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {playerInputs.map((value, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-fairway-800 mb-1">
                {numPlayers === 1 ? 'Tu Handicap Index (HI)' : `Jugador ${idx + 1} — Handicap Index (HI)`}
              </label>
              <input
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => updatePlayerInput(idx, e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <CourseTeeSelect
          courseId={courseId}
          teeIndex={teeIndex}
          onChange={(cId, tIdx, t) => {
            setCourseId(cId)
            setTeeIndex(tIdx)
            setTee(t)
            setShowRoundCalc(false)
            setShowDistribution(false)
          }}
        />

        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">
            Modalidad / % de handicap
          </label>
          <select
            value={allowance}
            onChange={(e) => {
              setAllowance(Number(e.target.value))
              setShowDistribution(false)
            }}
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
      ) : numPlayers === 1 ? (
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
        </>
      ) : (
        <div className="space-y-3">
          {playerResults.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-cream-300 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="font-medium text-fairway-900">Jugador {idx + 1}</div>
                <div className="text-xs text-fairway-500">HI {playerInputs[idx] || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-fairway-900">{r.courseHandicap}</div>
                {showDistribution && (
                  <div className="text-xs font-medium text-gold-600">
                    {strokesGiven[idx] === 0
                      ? 'Juega scratch'
                      : `Recibe ${strokesGiven[idx]} golpe${strokesGiven[idx] === 1 ? '' : 's'}`}
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowDistribution(true)}
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
          >
            Distribuir Handicap
          </button>
        </div>
      )}

      {tee && (
        <>
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
