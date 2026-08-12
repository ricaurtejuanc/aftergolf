import { useState, type FormEvent } from 'react'

const CONTACT_EMAIL = 'info@aftergolf.es'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const body = [message, '', `De: ${name} (${email})`].join('\n')
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Contacto AfterGolf — ${name}`,
    )}&body=${encodeURIComponent(body)}`
    window.location.href = url
    setSent(true)
  }

  function handleReset() {
    setName('')
    setEmail('')
    setMessage('')
    setSent(false)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Contacto</h1>
        <p className="mt-1 text-sm text-fairway-600">
          ¿Alguna duda, sugerencia o incidencia? Escríbenos y se abrirá tu
          aplicación de correo con el mensaje listo para enviar a{' '}
          {CONTACT_EMAIL}.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-fairway-300 bg-fairway-50 p-6 text-center">
          <p className="font-semibold text-fairway-900">
            Tu consulta ha sido enviada correctamente.
          </p>
          <p className="mt-1 text-sm text-fairway-600">
            Se ha abierto tu aplicación de correo con el mensaje listo — solo
            falta que le des a enviar.
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

          <button
            type="submit"
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
          >
            Enviar mensaje
          </button>
        </form>
      )}
    </div>
  )
}
