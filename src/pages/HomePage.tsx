import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useLanguage } from '../context/LanguageContext'

export function HomePage() {
  const { dict } = useLanguage()

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Logo className="h-56 w-56" />
        <p className="max-w-md text-fairway-700">{dict.home.heroText}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/antes-de-jugar"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            {dict.home.antesKicker}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">{dict.home.antesTitle}</h2>
          <p className="mt-2 text-sm text-fairway-600">{dict.home.antesDesc}</p>
        </Link>

        <Link
          to="/despues-de-jugar"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            {dict.home.despuesKicker}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">{dict.home.despuesTitle}</h2>
          <p className="mt-2 text-sm text-fairway-600">{dict.home.despuesDesc}</p>
        </Link>

        <Link
          to="/shop"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            {dict.home.shopKicker}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">{dict.home.shopTitle}</h2>
          <p className="mt-2 text-sm text-fairway-600">{dict.home.shopDesc}</p>
        </Link>
      </div>
    </div>
  )
}
