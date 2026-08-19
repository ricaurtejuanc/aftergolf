import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { translateAuthError } from '../lib/authErrors'

type Mode = 'login' | 'signup' | 'reset'

export function RegisterGate({ onCancel }: { onCancel?: () => void }) {
  const { signUp, signIn, signInWithGoogle, requestPasswordReset } = useAuth()
  const { dict } = useLanguage()
  const t = dict.registerGate
  const [mode, setMode] = useState<Mode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleGoogle() {
    setSending(true)
    setError(null)
    setInfo(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(translateAuthError(err, dict.authErrors))
      setSending(false)
    }
    // No `finally` — on success the browser navigates away to Google.
  }

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
          setInfo(t.signupConfirmationSent)
          setMode('login')
        }
      } else {
        await requestPasswordReset(email)
        setInfo(t.resetEmailSent)
        setMode('login')
      }
    } catch (err) {
      setError(translateAuthError(err, dict.authErrors))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      {mode !== 'reset' && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cream-300 px-4 py-2.5 text-sm font-medium text-fairway-800 transition hover:border-fairway-400 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.89c2.27-2.09 3.56-5.17 3.56-8.82Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A11.99 11.99 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.28a12 12 0 0 0 0 10.8l4.01-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.6l4.01 3.1C6.23 6.87 8.88 4.75 12 4.75Z"
              />
            </svg>
            {t.continueWithGoogle}
          </button>

          <div className="flex items-center gap-3 text-xs text-fairway-400">
            <div className="h-px flex-1 bg-cream-200" />
            {t.or}
            <div className="h-px flex-1 bg-cream-200" />
          </div>
        </>
      )}

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
            {t.login}
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
            {t.signup}
          </button>
        </div>
      )}

      {mode === 'signup' && <p className="text-sm text-fairway-700">{t.signupNote}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-fairway-700 mb-1">{t.firstName}</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fairway-700 mb-1">{t.lastName}</label>
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
          <label className="block text-xs font-medium text-fairway-700 mb-1">{t.email}</label>
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
            <label className="block text-xs font-medium text-fairway-700 mb-1">{t.password}</label>
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
            {t.forgotPassword}
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
              ? t.sending
              : mode === 'login'
                ? t.login
                : mode === 'signup'
                  ? t.signup
                  : t.sendResetEmail}
          </button>
          {mode === 'reset' ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-fairway-600 transition hover:border-fairway-400"
            >
              {t.back}
            </button>
          ) : (
            onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-fairway-600 transition hover:border-fairway-400"
              >
                {t.cancel}
              </button>
            )
          )}
        </div>
      </form>
    </div>
  )
}
