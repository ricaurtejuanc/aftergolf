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

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/handicap-de-juego"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Antes de jugar
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Handicap de Juego</h2>
          <p className="mt-2 text-sm text-fairway-600">
            Introduce tu Handicap Index y el tee que vas a jugar para saber
            cuántos golpes de ventaja tienes en ese campo.
          </p>
        </Link>

        <Link
          to="/post-ronda"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Después de jugar
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Handicap Jugado</h2>
          <p className="mt-2 text-sm text-fairway-600">
            Introduce tu resultado bruto y obtén tu resultado neto, puntos
            Stableford y el Score Differential de la ronda.
          </p>
        </Link>

        <Link
          to="/campos"
          className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:border-fairway-400 hover:shadow-md"
        >
          <div className="text-sm font-semibold uppercase tracking-wide text-gold-600">
            Base de datos
          </div>
          <h2 className="mt-1 text-xl font-semibold text-fairway-900">Campos</h2>
          <p className="mt-2 text-sm text-fairway-600">
            55 campos de golf españoles con Course Rating, Slope y Par por
            cada tee.
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
            Merchandising AfterGolf: gorras, polos y accesorios con el
            escudo del club.
          </p>
        </Link>
      </div>
    </div>
  )
}
