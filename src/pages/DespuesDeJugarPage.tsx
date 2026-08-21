import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { InfoTooltip } from '../components/InfoTooltip'
import { RegisterGate } from '../components/RegisterGate'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { interpolate, useLanguage } from '../context/LanguageContext'
import type { CourseTee } from '../data/courses'
import { calculateCourseHandicap, calculateRoundResult } from '../lib/handicap'
import { stashPendingRounds } from '../lib/pendingRounds'
import { loadHandicapIndex, saveRound, type SavedRound } from '../lib/storage'

const MAX_PLAYERS = 4

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface PlayerInput {
  hi: string
  gross: string
  pcc: string
}

function blankPlayer(): PlayerInput {
  return { hi: '12', gross: '90', pcc: '0' }
}

export function DespuesDeJugarPage() {
  const { user } = useAuth()
  const { dict } = useLanguage()
  const t = dict.despuesDeJugar
  const [numPlayers, setNumPlayers] = useState(1)
  const [players, setPlayers] = useState<PlayerInput[]>(() => [
    { hi: String(loadHandicapIndex() ?? 12.0), gross: '90', pcc: '0' },
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

  function handleReset() {
    setNumPlayers(1)
    setPlayers([{ hi: String(loadHandicapIndex() ?? 12.0), gross: '90', pcc: '0' }])
    setCourseId('')
    setTeeIndex(0)
    setTee(null)
    setCourseName('')
    setCourseLocation('')
    setDatePlayed(today())
    setSaved(false)
    setSaving(false)
    setShowRegister(false)
  }

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
      pcc: Number(p.pcc) || 0,
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
          pcc: Number(p.pcc) || 0,
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
        <h1 className="text-2xl font-semibold text-fairway-900">{t.title}</h1>
        <p className="mt-1 text-sm text-fairway-600">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">
            {t.numPlayers}
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
                <div className="text-sm font-semibold text-fairway-900">{interpolate(t.player, { n: idx + 1 })}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-fairway-800 mb-1">
                  {t.handicapIndex}
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
                  {t.grossStableford}
                  <InfoTooltip text={dict.explanations.grossStableford} />
                </label>
                <input
                  type="number"
                  value={p.gross}
                  onChange={(e) => updatePlayer(idx, { gross: e.target.value })}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center text-sm font-medium text-fairway-800">
                  {t.pccAdjustment}
                  <InfoTooltip text={dict.explanations.pcc} />
                </label>
                <input
                  type="number"
                  step="1"
                  value={p.pcc}
                  onChange={(e) => updatePlayer(idx, { pcc: e.target.value })}
                  className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-fairway-800 mb-1">{t.date}</label>
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
          {t.selectCoursePrompt}
        </div>
      ) : numPlayers === 1 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label={t.hcpDeJuego} value={courseHandicap} />
            <StatCard label={t.strokesReceived} value={result.strokesReceived} />
            <StatCard label={t.netScore} value={result.netScore} accent />
            <StatCard label={t.stablefordPoints} value={result.stablefordPoints} />
          </div>

          <StatCard
            label={t.scoreDifferential}
            value={result.differential.toFixed(1)}
            hint={t.scoreDifferentialFormula}
            accent
          />
        </>
      ) : (
        <div className="space-y-6">
          {results.map(
            (r, idx) =>
              r && (
                <div key={idx} className="space-y-3">
                  <div className="text-sm font-semibold text-fairway-900">
                    {interpolate(t.player, { n: idx + 1 })}
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label={t.hcpDeJuego} value={r.courseHandicap} />
                    <StatCard label={t.strokesReceived} value={r.strokesReceived} />
                    <StatCard label={t.netScore} value={r.netScore} accent />
                    <StatCard label={t.stablefordPoints} value={r.stablefordPoints} />
                  </div>
                  <StatCard
                    label={t.scoreDifferential}
                    value={r.differential.toFixed(1)}
                    hint={t.scoreDifferentialFormula}
                    accent
                  />
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
                ? t.savedButton
                : saving
                  ? t.savingButton
                  : numPlayers > 1
                    ? t.saveRoundsButton
                    : t.saveRoundButton}
            </button>
          )}

          <Link
            to="/historial"
            className="block text-center text-sm text-fairway-600 underline-offset-2 hover:underline"
          >
            {t.viewHistoryLink}
          </Link>

          <button
            onClick={handleReset}
            className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-fairway-700 transition hover:border-fairway-400"
          >
            {t.newCalculation}
          </button>
        </>
      )}
    </div>
  )
}
