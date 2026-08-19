import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function PasswordRecoveryGate() {
  const { passwordRecovery, completePasswordRecovery } = useAuth()
  const { dict } = useLanguage()
  const t = dict.passwordRecoveryGate
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!passwordRecovery) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError(t.passwordTooShort)
      return
    }
    if (password !== confirm) {
      setError(t.passwordsDontMatch)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await completePasswordRecovery(password)
      setDone(true)
    } catch {
      setError(t.updateFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fairway-950/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        {done ? (
          <p className="text-center text-sm text-fairway-800">{t.done}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-lg font-semibold text-fairway-900">{t.title}</h2>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.newPassword}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t.repeatPassword}
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
            >
              {saving ? t.saving : t.save}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
