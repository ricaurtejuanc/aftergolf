const RFEG_URL = 'https://rfegolf.es/paginasservicios/serviciohandicap.aspx'

export function FederatedHandicapPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fairway-900">Handicap Federado</h1>
          <p className="mt-1 text-sm text-fairway-600">
            Busca tu Handicap Index oficial en el buscador de la Real
            Federación Española de Golf (RFEG), por nombre o licencia.
          </p>
        </div>
        <a
          href={RFEG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium text-fairway-800 transition hover:border-fairway-400"
        >
          Abrir en la RFEG ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        <iframe
          src={RFEG_URL}
          title="Consulta de Handicap RFEG"
          className="h-[720px] w-full"
        />
      </div>

      <p className="text-xs text-fairway-500">
        Si el buscador no carga aquí dentro (algunos navegadores o la propia
        RFEG pueden bloquear la incrustación), usa el botón "Abrir en la
        RFEG" de arriba para consultarlo en una pestaña nueva.
      </p>
    </div>
  )
}
