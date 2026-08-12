import { useState, type FormEvent } from 'react'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../lib/supabaseClient'

const CONTACT_EMAIL = 'info@aftergolf.es'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ name, email, message }),
      })
      if (!response.ok) throw new Error('request failed')
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  function handleReset() {
    setName('')
    setEmail('')
    setMessage('')
    setSent(false)
    setError(false)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Contacto</h1>
        <p className="mt-1 text-sm text-fairway-600">
          ¿Alguna duda, sugerencia o incidencia? Escríbenos y te responderemos
          a {CONTACT_EMAIL}.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-fairway-300 bg-fairway-50 p-6 text-center">
          <p className="font-semibold text-fairway-900">
            Tu consulta ha sido enviada correctamente.
          </p>
          <p className="mt-1 text-sm text-fairway-600">
            Te responderemos lo antes posible al email que nos has indicado.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 text-sm text-fairway-600 underline-offset-2 hover:underline"
          >
            Enviar otra consulta
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-fairway-800 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fairway-800 mb-1">
              Tu email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fairway-800 mb-1">
              Mensaje
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              No se pudo enviar el mensaje. Inténtalo de nuevo en un momento.
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
          >
            {sending ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      )}
    </div>
  )
}
