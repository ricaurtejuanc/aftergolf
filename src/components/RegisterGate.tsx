import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { translateAuthError } from '../lib/authErrors'

type Mode = 'login' | 'signup' | 'reset'

export function RegisterGate({ onCancel }: { onCancel?: () => void }) {
  const { signUp, signIn, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        const { needsConfirmation } = await signUp({ firstName, lastName, email, password })
        if (needsConfirmation) {
          setInfo('Te hemos enviado un correo para confirmar tu cuenta. Ábrelo y luego inicia sesión aquí.')
          setMode('login')
        }
      } else {
        await requestPasswordReset(email)
        setInfo('Te hemos enviado un correo para restablecer tu contraseña.')
        setMode('login')
      }
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      {mode !== 'reset' && (
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              mode === 'login'
                ? 'bg-fairway-800 text-cream-50'
                : 'border border-cream-300 text-fairway-700 hover:border-fairway-400'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              mode === 'signup'
                ? 'bg-fairway-800 text-cream-50'
                : 'border border-cream-300 text-fairway-700 hover:border-fairway-400'
            }`}
          >
            Crear cuenta
          </button>
        </div>
      )}

      {mode === 'signup' && (
        <p className="text-sm text-fairway-700">
          Para guardar tu ronda necesitamos que te registres — así tu
          historial queda ligado a tu cuenta, no solo a este navegador.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
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
        )}

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

        {mode !== 'reset' && (
          <div>
            <label className="block text-xs font-medium text-fairway-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
          </div>
        )}

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => switchMode('reset')}
            className="text-xs text-fairway-600 underline-offset-2 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-fairway-700">{info}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
          >
            {sending
              ? 'Enviando...'
              : mode === 'login'
                ? 'Iniciar sesión'
                : mode === 'signup'
                  ? 'Crear cuenta'
                  : 'Enviar correo de recuperación'}
          </button>
          {mode === 'reset' ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-fairway-600 transition hover:border-fairway-400"
            >
              Volver
            </button>
          ) : (
            onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-fairway-600 transition hover:border-fairway-400"
              >
                Cancelar
              </button>
            )
          )}
        </div>
      </form>
    </div>
  )
}
