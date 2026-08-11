import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Logo className="h-56 w-56" />
        <p className="max-w-md text-fairway-700">
          Calcula tu handicap de juego antes de salir y tu handicap jugado al
          terminar la ronda, con las fórmulas oficiales del World Handicap
          System (WHS / RFEG).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/antes-de-jugar"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Antes de jugar
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Antes de Jugar</h2>
          <p className="mt-2 text-sm text-fairway-600">
            Busca tu Handicap Index oficial y calcula cuántos golpes de
            ventaja tienes en el campo y tee que vas a jugar.
          </p>
        </Link>

        <Link
          to="/despues-de-jugar"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Después de jugar
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Después de Jugar</h2>
          <p className="mt-2 text-sm text-fairway-600">
            Introduce tu resultado bruto y obtén tu resultado neto, puntos
            Stableford, el Score Differential y tu historial de rondas.
          </p>
        </Link>

        <Link
          to="/shop"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            19º hoyo
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Shop</h2>
          <p className="mt-2 text-sm text-fairway-600">
            Merchandising AfterGolf: bolas de golf y accesorios con el escudo
            del club.
          </p>
        </Link>
      </div>
    </div>
  )
}
