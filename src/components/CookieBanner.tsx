import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const DISMISSED_KEY = 'aftergolf.cookieBannerDismissed'

export function CookieBanner() {
  const { dict } = useLanguage()
  const t = dict.cookieBanner
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  function accept() {
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Storage unavailable (private mode, blocked) — dismiss for this
      // session anyway rather than trapping the user behind the banner.
    }
    setDismissed(true)
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-cream-300 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:bottom-0">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-fairway-700 sm:text-left">
          {t.text}{' '}
          <Link to="/privacidad" className="underline-offset-2 hover:underline">
            {t.linkText}
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="w-full flex-shrink-0 rounded-lg bg-fairway-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-fairway-800 sm:w-auto"
        >
          {t.accept}
        </button>
      </div>
    </div>
  )
}
