import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function RegisterGate({ onCancel }: { onCancel?: () => void }) {
  const { requestMagicLink } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      await requestMagicLink({ firstName, lastName, email })
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-fairway-300 bg-fairway-50 p-5 text-center">
        <p className="font-semibold text-fairway-900">Revisa tu correo</p>
        <p className="mt-1 text-sm text-fairway-600">
          Te hemos enviado un enlace a {email}. Ábrelo para confirmar tu
          cuenta — tu ronda se guardará automáticamente en cuanto vuelvas.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
    >
      <p className="text-sm text-fairway-700">
        Para guardar tu ronda necesitamos que te registres — así tu
        historial queda ligado a tu cuenta, no solo a este navegador.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Apellidos</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">No se pudo enviar el enlace. Inténtalo de nuevo.</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
        >
          {sending ? 'Enviando...' : 'Enviar enlace de acceso'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-fairway-600 transition hover:border-fairway-400"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
