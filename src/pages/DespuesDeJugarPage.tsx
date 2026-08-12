import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { InfoTooltip } from '../components/InfoTooltip'
import { RegisterGate } from '../components/RegisterGate'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import type { CourseTee } from '../data/courses'
import {
  calculateCourseHandicap,
  calculateRoundResult,
  GROSS_STABLEFORD_EXPLANATION,
} from '../lib/handicap'
import { stashPendingRounds } from '../lib/pendingRounds'
import { loadHandicapIndex, saveRound, type SavedRound } from '../lib/storage'

const MAX_PLAYERS = 4

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface PlayerInput {
  hi: string
  gross: string
}

function blankPlayer(): PlayerInput {
  return { hi: '12', gross: '90' }
}

export function DespuesDeJugarPage() {
  const { user } = useAuth()
  const [numPlayers, setNumPlayers] = useState(1)
  const [players, setPlayers] = useState<PlayerInput[]>(() => [
    { hi: String(loadHandicapIndex() ?? 12.0), gross: '90' },
  ])
  const [courseId, setCourseId] = useState('')
  const [teeIndex, setTeeIndex] = useState(0)
  const [tee, setTee] = useState<CourseTee | null>(null)
  const [courseName, setCourseName] = useState('')
  const [courseLocation, setCourseLocation] = useState('')
  const [datePlayed, setDatePlayed] = useState(today())
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  function handleNumPlayersChange(n: number) {
    setNumPlayers(n)
    setPlayers((prev) => {
      if (n === prev.length) return prev
      if (n > prev.length) {
        return [...prev, ...Array.from({ length: n - prev.length }, blankPlayer)]
      }
      return prev.slice(0, n)
    })
    setSaved(false)
  }

  function updatePlayer(idx: number, patch: Partial<PlayerInput>) {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
    setSaved(false)
  }

  const results = players.map((p) => {
    if (!tee) return null
    const { courseHandicap } = calculateCourseHandicap({
      handicapIndex: Number(p.hi) || 0,
      slopeRating: tee.slope,
      courseRating: tee.cr,
      par: tee.par,
    })
    const result = calculateRoundResult({
      courseHandicap,
      grossScore: Number(p.gross) || 0,
      slopeRating: tee.slope,
      courseRating: tee.cr,
      par: tee.par,
    })
    return { courseHandicap, ...result }
  })

  function buildRoundsToSave(): Omit<SavedRound, 'id'>[] {
    if (!tee) return []
    return players
      .map((p, idx): Omit<SavedRound, 'id'> | null => {
        const r = results[idx]
        if (!r) return null
        const round: Omit<SavedRound, 'id'> = {
          courseName,
          courseLocation,
          teeColor: tee.color,
          teeGender: tee.gender,
          courseRating: tee.cr,
          slopeRating: tee.slope,
          par: tee.par,
          handicapIndex: Number(p.hi) || 0,
          courseHandicap: r.courseHandicap,
          grossScore: Number(p.gross) || 0,
          strokesReceived: r.strokesReceived,
          netScore: r.netScore,
          stablefordPoints: r.stablefordPoints,
          differential: r.differential,
          datePlayed,
        }
        if (numPlayers > 1) round.playerLabel = `Jugador ${idx + 1}`
        return round
      })
      .filter((r): r is Omit<SavedRound, 'id'> => r !== null)
  }

  async function handleSave() {
    const roundsToSave = buildRoundsToSave()
    if (roundsToSave.length === 0) return

    if (!user) {
      stashPendingRounds(roundsToSave)
      setShowRegister(true)
      return
    }

    setSaving(true)
    try {
      for (const round of roundsToSave) {
        await saveRound(round, user.id)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const result = results[0]
  const courseHandicap = result?.courseHandicap ?? 0

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

        <div className="space-y-4">
          {players.map((p, idx) => (
            <div
              key={idx}
              className={numPlayers > 1 ? 'space-y-3 rounded-lg border border-cream-200 p-3' : 'space-y-3'}
            >
              {numPlayers > 1 && (
                <div className="text-sm font-semibold text-fairway-900">Jugador {idx + 1}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-fairway-800 mb-1">
                  Handicap Index (HI)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={p.hi}
                  onChange={(e) => updatePlayer(idx, { hi: e.target.value })}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center text-sm font-medium text-fairway-800">
                  Resultado Bruto Stableford
                  <InfoTooltip text={GROSS_STABLEFORD_EXPLANATION} />
                </label>
                <input
                  type="number"
                  value={p.gross}
                  onChange={(e) => updatePlayer(idx, { gross: e.target.value })}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">Fecha</label>
          <input
            type="date"
            value={datePlayed}
            onChange={(e) => setDatePlayed(e.target.value)}
            className="box-border w-full min-w-0 max-w-full appearance-none rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 [color-scheme:light] focus:border-fairway-500 focus:outline-none"
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
            setSaved(false)
          }}
        />
      </div>

      {!tee || !result ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          Selecciona un campo y tee para ver tu resultado.
        </div>
      ) : numPlayers === 1 ? (
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
        </>
      ) : (
        <div className="space-y-3">
          {results.map(
            (r, idx) =>
              r && (
                <div
                  key={idx}
                  className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm"
                >
                  <div className="font-medium text-fairway-900">Jugador {idx + 1}</div>
                  <div className="mt-1 text-sm text-fairway-700">
                    Hcp {r.courseHandicap} · Golpes recibidos {r.strokesReceived} · Neto{' '}
                    {r.netScore} · Stableford {r.stablefordPoints} pts · Diff{' '}
                    {r.differential.toFixed(1)}
                  </div>
                </div>
              ),
          )}
        </div>
      )}

      {tee && result && (
        <>
          {showRegister ? (
            <RegisterGate onCancel={() => setShowRegister(false)} />
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
            >
              {saved
                ? 'Ronda guardada ✓'
                : saving
                  ? 'Guardando...'
                  : numPlayers > 1
                    ? 'Guardar rondas en el historial'
                    : 'Guardar ronda en mi historial'}
            </button>
          )}

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
