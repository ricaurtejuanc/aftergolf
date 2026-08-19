import { useEffect, useState } from 'react'
import { RegisterGate } from '../components/RegisterGate'
import { useAuth } from '../context/AuthContext'
import { interpolate, useLanguage } from '../context/LanguageContext'
import { deleteRound, loadRounds, type SavedRound } from '../lib/storage'

export function HistoryPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { dict } = useLanguage()
  const t = dict.history
  const [rounds, setRounds] = useState<SavedRound[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRounds([])
      setLoading(false)
      return
    }
    setLoading(true)
    loadRounds()
      .then(setRounds)
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete(id: string) {
    await deleteRound(id)
    setRounds((prev) => prev.filter((r) => r.id !== id))
  }

  // rounds is already sorted most-recent-first (see loadRounds()), so the
  // first 8 are the last 8 played.
  const recentRounds = rounds.slice(0, 8)
  const avgDifferential =
    recentRounds.length > 0
      ? (recentRounds.reduce((sum, r) => sum + r.differential, 0) / recentRounds.length).toFixed(1)
      : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fairway-900">{t.title}</h1>
          <p className="mt-1 text-sm text-fairway-600">{t.subtitle}</p>
        </div>
        {user && profile && (
          <div className="text-right text-xs text-fairway-500">
            <div>
              {t.greetingPrefix}
              <span className="font-medium text-fairway-700">{profile.firstName}</span>
            </div>
            <button onClick={signOut} className="underline-offset-2 hover:underline">
              {t.signOut}
            </button>
          </div>
        )}
      </div>

      {authLoading ? null : !user ? (
        <RegisterGate />
      ) : loading ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          {t.loading}
        </div>
      ) : rounds.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          {t.empty}
        </div>
      ) : (
        <>
          {avgDifferential && (
            <div className="rounded-xl border border-gold-400 bg-gold-400/10 p-4 text-fairway-800">
              {interpolate(t.avgDifferential, { n: recentRounds.length })}{' '}
              <span className="font-semibold text-fairway-900">{avgDifferential}</span>
            </div>
          )}
          <div className="space-y-3">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-cream-300 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="font-medium text-fairway-900">
                    {r.courseName}
                    {r.playerLabel && (
                      <span className="ml-2 text-xs font-normal text-gold-600">
                        {r.playerLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-fairway-500">
                    {r.datePlayed} · Tee {dict.teeColors[r.teeColor]} · CR {r.courseRating} / Slope{' '}
                    {r.slopeRating}
                  </div>
                  <div className="mt-1 text-sm text-fairway-700">
                    {interpolate(t.grossNetStableford, {
                      gross: r.grossScore,
                      net: r.netScore,
                      stableford: r.stablefordPoints,
                      diff: r.differential.toFixed(1),
                    })}
                    {r.pcc ? interpolate(t.pccSuffix, { pcc: `${r.pcc > 0 ? '+' : ''}${r.pcc}` }) : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs text-fairway-500 transition hover:border-red-400 hover:text-red-500"
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
