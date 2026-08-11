import { useState } from 'react'
import { TEE_LABEL } from '../components/CourseTeeSelect'
import { deleteRound, loadRounds, type SavedRound } from '../lib/storage'

export function HistoryPage() {
  const [rounds, setRounds] = useState<SavedRound[]>(() => loadRounds())

  function handleDelete(id: string) {
    setRounds(deleteRound(id))
  }

  const avgDifferential =
    rounds.length > 0
      ? (rounds.reduce((sum, r) => sum + r.differential, 0) / rounds.length).toFixed(1)
      : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Historial de rondas</h1>
        <p className="mt-1 text-sm text-fairway-300">
          Rondas guardadas localmente en este dispositivo.
        </p>
      </div>

      {rounds.length === 0 ? (
        <div className="rounded-xl border border-fairway-800 bg-fairway-900/30 p-8 text-center text-fairway-300">
          Aún no has guardado ninguna ronda. Calcula tu handicap jugado y pulsa
          "Guardar ronda".
        </div>
      ) : (
        <>
          {avgDifferential && (
            <div className="rounded-xl border border-fairway-400 bg-fairway-400/10 p-4 text-fairway-100">
              Differential medio de las últimas {rounds.length} rondas:{' '}
              <span className="font-semibold text-white">{avgDifferential}</span>
            </div>
          )}
          <div className="space-y-3">
            {rounds.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-fairway-800 bg-fairway-900/40 p-4"
              >
                <div>
                  <div className="font-medium text-white">{r.courseName}</div>
                  <div className="text-xs text-fairway-400">
                    {r.datePlayed} · Tee {TEE_LABEL[r.teeColor]} · CR {r.courseRating} / Slope{' '}
                    {r.slopeRating}
                  </div>
                  <div className="mt-1 text-sm text-fairway-200">
                    Bruto {r.grossScore} · Neto {r.netScore} · Stableford{' '}
                    {r.stablefordPoints} pts · Diff {r.differential.toFixed(1)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg border border-fairway-700 px-3 py-1.5 text-xs text-fairway-300 transition hover:border-red-400 hover:text-red-300"
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
