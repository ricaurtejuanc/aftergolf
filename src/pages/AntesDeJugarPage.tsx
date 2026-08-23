import { useEffect, useState } from 'react'
import { CourseTeeSelect } from '../components/CourseTeeSelect'
import { InfoTooltip } from '../components/InfoTooltip'
import { StatCard } from '../components/StatCard'
import { interpolate, useLanguage } from '../context/LanguageContext'
import type { CourseTee, HoleScore } from '../data/courses'
import type { es } from '../i18n/es'
import {
  calculateCourseHandicap,
  calculateRoundResult,
  HANDICAP_ALLOWANCES,
  strokesOnHole,
} from '../lib/handicap'
import { loadHoleScores } from '../lib/holeScoreStore'
import { loadHandicapIndex, saveHandicapIndex } from '../lib/storage'

const MAX_PLAYERS = 4

function HolesWithStrokesModal({
  holes,
  numPlayers,
  distributedStrokes,
  fullStrokes,
  onClose,
  dict,
}: {
  holes: HoleScore[]
  numPlayers: number
  /** Strokes relative to the group's lowest handicap (scratch = 0) — only meaningful with 2+ players. */
  distributedStrokes: number[]
  /** Each player's own full course handicap, ignoring the rest of the group. */
  fullStrokes: number[]
  onClose: () => void
  dict: typeof es
}) {
  const t = dict.courseTeeSelect
  const [filter, setFilter] = useState<'all' | 'front' | 'back'>('all')
  const [distribute, setDistribute] = useState(true)
  const effectiveStrokes = numPlayers > 1 && distribute ? distributedStrokes : fullStrokes
  const visible = holes.filter((h) =>
    filter === 'front' ? h.holeNumber <= 9 : filter === 'back' ? h.holeNumber >= 10 : true,
  )
  const totalMeters = visible.reduce((sum, h) => sum + h.meters, 0)
  const totalPar = visible.reduce((sum, h) => sum + h.par, 0)
  const players = Array.from({ length: numPlayers }, (_, i) => i)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-fairway-900">{dict.antesDeJugar.viewHolesWithStrokes}</h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs text-fairway-500 underline-offset-2 hover:underline"
          >
            {t.closeScorecard}
          </button>
        </div>

        {numPlayers > 1 && (
          <label className="mb-3 flex items-center gap-2 text-xs font-medium text-fairway-700">
            <input
              type="checkbox"
              checked={distribute}
              onChange={(e) => setDistribute(e.target.checked)}
            />
            {dict.antesDeJugar.distributeHandicap}
          </label>
        )}

        <div className="mb-3 flex gap-2">
          {(['all', 'front', 'back'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                filter === f
                  ? 'border-fairway-700 bg-fairway-800 text-cream-50'
                  : 'border-cream-300 bg-white text-fairway-700 hover:border-fairway-400'
              }`}
            >
              {f === 'all' ? t.filterAll : f === 'front' ? t.filterFront : t.filterBack}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-left text-xs uppercase tracking-wide text-fairway-500">
                <th className="py-1.5 pr-2">{t.holeNumber}</th>
                <th className="py-1.5 pr-2">{t.distance}</th>
                <th className="py-1.5 pr-2">Par</th>
                <th className="py-1.5 pr-2">Hcp</th>
                {players.map((p) => (
                  <th key={p} className="py-1.5 pr-2 text-center">
                    {interpolate(
                      numPlayers > 1 ? dict.antesDeJugar.playerAbbrev : dict.antesDeJugar.player,
                      { n: p + 1 },
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((h) => (
                <tr key={h.holeNumber} className="border-b border-cream-100 text-fairway-900">
                  <td className="py-1.5 pr-2">{h.holeNumber}</td>
                  <td className="py-1.5 pr-2">{h.meters} m</td>
                  <td className="py-1.5 pr-2">{h.par}</td>
                  <td className="py-1.5 pr-2">{h.hcp}</td>
                  {players.map((p) => {
                    const strokes = strokesOnHole(effectiveStrokes[p] ?? 0, h.hcp)
                    return (
                      <td key={p} className="py-1.5 pr-2 text-center font-semibold text-gold-600">
                        {strokes > 0 ? '*'.repeat(strokes) : ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-sm font-semibold text-fairway-900">
                <td className="py-1.5 pr-2">{t.scorecardTotals}</td>
                <td className="py-1.5 pr-2">{totalMeters} m</td>
                <td className="py-1.5 pr-2">{totalPar}</td>
                <td className="py-1.5 pr-2" />
                {players.map((p) => (
                  <td key={p} className="py-1.5 pr-2" />
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AntesDeJugarPage() {
  const { dict } = useLanguage()
  const t = dict.antesDeJugar
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
  const [grossScoreInputs, setGrossScoreInputs] = useState<string[]>(['90'])
  const [pccInputs, setPccInputs] = useState<string[]>(['0'])
  const [holes, setHoles] = useState<HoleScore[]>([])
  const [showHolesWithStrokes, setShowHolesWithStrokes] = useState(false)

  const handicapIndex = Number(playerInputs[0]) || 0

  useEffect(() => {
    saveHandicapIndex(handicapIndex)
  }, [handicapIndex])

  useEffect(() => {
    setShowHolesWithStrokes(false)
    if (!tee?.id) {
      setHoles([])
      return
    }
    let cancelled = false
    loadHoleScores(tee.id).then((h) => {
      if (!cancelled) setHoles(h)
    })
    return () => {
      cancelled = true
    }
  }, [tee?.id])

  function handleReset() {
    setNumPlayers(1)
    setPlayerInputs([String(loadHandicapIndex() ?? 12.0)])
    setCourseId('')
    setTeeIndex(0)
    setTee(null)
    setAllowance(1)
    setShowRoundCalc(false)
    setShowDistribution(false)
    setGrossScoreInputs(['90'])
    setPccInputs(['0'])
  }

  function handleNumPlayersChange(n: number) {
    setNumPlayers(n)
    setPlayerInputs((prev) => {
      if (n === prev.length) return prev
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill('12')]
      return prev.slice(0, n)
    })
    setGrossScoreInputs((prev) => {
      if (n === prev.length) return prev
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill('90')]
      return prev.slice(0, n)
    })
    setPccInputs((prev) => {
      if (n === prev.length) return prev
      if (n > prev.length) return [...prev, ...Array(n - prev.length).fill('0')]
      return prev.slice(0, n)
    })
    setShowDistribution(false)
  }

  function updatePlayerInput(idx: number, value: string) {
    setPlayerInputs((prev) => prev.map((v, i) => (i === idx ? value : v)))
    setShowDistribution(false)
  }

  function updateGrossScoreInput(idx: number, value: string) {
    setGrossScoreInputs((prev) => prev.map((v, i) => (i === idx ? value : v)))
  }

  function updatePccInput(idx: number, value: string) {
    setPccInputs((prev) => prev.map((v, i) => (i === idx ? value : v)))
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

  const roundResults = playerResults.map((r, idx) => {
    const grossScore = Number(grossScoreInputs[idx]) || 0
    const pcc = Number(pccInputs[idx]) || 0
    return tee
      ? calculateRoundResult({
          courseHandicap: r.courseHandicap,
          grossScore,
          slopeRating: tee.slope,
          courseRating: tee.cr,
          par: tee.par,
          pcc,
        })
      : null
  })

  const roundResult = roundResults[0]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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

        <div className="space-y-3">
          {playerInputs.map((value, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-fairway-800 mb-1">
                {numPlayers === 1 ? t.yourHi : interpolate(t.playerHi, { n: idx + 1 })}
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
            {t.allowance}
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
          {t.selectCoursePrompt}
        </div>
      ) : numPlayers === 1 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label={t.courseHandicap} value={courseHandicap} accent />
            <StatCard label={t.exactValue} value={exact.toFixed(2)} />
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
                <div className="font-medium text-fairway-900">{interpolate(t.player, { n: idx + 1 })}</div>
                <div className="text-xs text-fairway-500">HI {playerInputs[idx] || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-fairway-900">{r.courseHandicap}</div>
                {showDistribution && (
                  <div className="text-xs font-medium text-gold-600">
                    {strokesGiven[idx] === 0
                      ? t.scratch
                      : interpolate(strokesGiven[idx] === 1 ? t.receivesStroke : t.receivesStrokes, {
                          n: strokesGiven[idx],
                        })}
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowDistribution(true)}
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
          >
            {t.distributeHandicap}
          </button>
        </div>
      )}

      {tee && holes.length > 0 && (
        <button
          type="button"
          onClick={() => setShowHolesWithStrokes(true)}
          className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-xs font-medium text-fairway-700 transition hover:border-fairway-400"
        >
          {t.viewHolesWithStrokes}
        </button>
      )}

      {showHolesWithStrokes && (
        <HolesWithStrokesModal
          holes={holes}
          numPlayers={numPlayers}
          distributedStrokes={strokesGiven}
          fullStrokes={playerResults.map((r) => r.courseHandicap)}
          onClose={() => setShowHolesWithStrokes(false)}
          dict={dict}
        />
      )}

      {tee && (
        <>
          {!showRoundCalc ? (
            <button
              onClick={() => setShowRoundCalc(true)}
              className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
            >
              {t.calculateRoundButton}
            </button>
          ) : numPlayers === 1 ? (
            roundResult && (
              <div className="space-y-4 border-t border-cream-300 pt-6">
                <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
                  <label className="mb-1 flex items-center text-sm font-medium text-fairway-800">
                    {t.grossStableford}
                    <InfoTooltip text={dict.explanations.grossStableford} />
                  </label>
                  <input
                    type="number"
                    value={grossScoreInputs[0]}
                    onChange={(e) => updateGrossScoreInput(0, e.target.value)}
                    className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                  />
                  <label className="mb-1 mt-3 flex items-center text-sm font-medium text-fairway-800">
                    {t.pccAdjustment}
                    <InfoTooltip text={dict.explanations.pcc} />
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={pccInputs[0]}
                    onChange={(e) => updatePccInput(0, e.target.value)}
                    className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label={t.strokesReceived} value={roundResult.strokesReceived} />
                  <StatCard label={t.netScore} value={roundResult.netScore} accent />
                  <StatCard label={t.stablefordPoints} value={roundResult.stablefordPoints} />
                  <StatCard
                    label={t.playedHandicap}
                    value={roundResult.differential.toFixed(1)}
                    accent
                  />
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3 border-t border-cream-300 pt-6">
              {playerInputs.map((_, idx) => {
                const r = roundResults[idx]
                return (
                  <div
                    key={idx}
                    className="space-y-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm"
                  >
                    <div className="text-sm font-semibold text-fairway-900">{interpolate(t.player, { n: idx + 1 })}</div>
                    <div>
                      <label className="mb-1 flex items-center text-xs font-medium text-fairway-700">
                        {t.grossStableford}
                        <InfoTooltip text={dict.explanations.grossStableford} />
                      </label>
                      <input
                        type="number"
                        value={grossScoreInputs[idx]}
                        onChange={(e) => updateGrossScoreInput(idx, e.target.value)}
                        className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center text-xs font-medium text-fairway-700">
                        {t.pccAdjustment}
                        <InfoTooltip text={dict.explanations.pcc} />
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={pccInputs[idx]}
                        onChange={(e) => updatePccInput(idx, e.target.value)}
                        className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
                      />
                    </div>
                    {r && (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard label={t.strokesReceived} value={r.strokesReceived} />
                        <StatCard label={t.netScore} value={r.netScore} accent />
                        <StatCard label={t.stablefordPoints} value={r.stablefordPoints} />
                        <StatCard label={t.playedHandicap} value={r.differential.toFixed(1)} accent />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tee && (
        <button
          onClick={handleReset}
          className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-fairway-700 transition hover:border-fairway-400"
        >
          {t.newCalculation}
        </button>
      )}
    </div>
  )
}
