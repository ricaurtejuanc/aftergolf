import { useEffect } from 'react'
import { TermsContent } from '../pages/TermsPage'

export function TermsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-end">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 text-2xl leading-none text-fairway-400 transition hover:text-fairway-700"
          >
            ✕
          </button>
        </div>
        <TermsContent />
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-cream-300 px-4 py-2 text-sm text-fairway-600 transition hover:text-fairway-900"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
