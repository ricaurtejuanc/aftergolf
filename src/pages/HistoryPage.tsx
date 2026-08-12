import { useEffect, useState } from 'react'
import { TEE_LABEL } from '../components/CourseTeeSelect'
import { RegisterGate } from '../components/RegisterGate'
import { useAuth } from '../context/AuthContext'
import { deleteRound, loadRounds, type SavedRound } from '../lib/storage'

export function HistoryPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
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

  const avgDifferential =
    rounds.length > 0
      ? (rounds.reduce((sum, r) => sum + r.differential, 0) / rounds.length).toFixed(1)
      : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fairway-900">Historial de rondas</h1>
          <p className="mt-1 text-sm text-fairway-600">
            Tu historial está ligado a tu cuenta, así lo ves igual desde
            cualquier dispositivo.
          </p>
        </div>
        {user && profile && (
          <div className="text-right text-xs text-fairway-500">
            <div>
              Hola, <span className="font-medium text-fairway-700">{profile.firstName}</span>
            </div>
            <button onClick={signOut} className="underline-offset-2 hover:underline">
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {authLoading ? null : !user ? (
        <RegisterGate />
      ) : loading ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          Cargando historial...
        </div>
      ) : rounds.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-8 text-center text-fairway-500">
          Aún no has guardado ninguna ronda. Calcula tu handicap jugado y pulsa
          "Guardar ronda".
        </div>
      ) : (
        <>
          {avgDifferential && (
            <div className="rounded-xl border border-gold-400 bg-gold-400/10 p-4 text-fairway-800">
              Differential medio de las últimas {rounds.length} rondas:{' '}
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
                    {r.datePlayed} · Tee {TEE_LABEL[r.teeColor]} · CR {r.courseRating} / Slope{' '}
                    {r.slopeRating}
                  </div>
                  <div className="mt-1 text-sm text-fairway-700">
                    Bruto {r.grossScore} · Neto {r.netScore} · Stableford{' '}
                    {r.stablefordPoints} pts · Diff {r.differential.toFixed(1)}
                    {r.pcc ? ` (PCC ${r.pcc > 0 ? '+' : ''}${r.pcc})` : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs text-fairway-500 transition hover:border-red-400 hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
