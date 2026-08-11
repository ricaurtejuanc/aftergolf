const HANDICAP_LOOKUP_EMBED_URL = 'https://www.golfdirecto.com/embed/handicap/search'

export function FederatedHandicapPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Handicap Federado</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Busca tu Handicap Index oficial (RFEG), por nombre o licencia.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        <iframe
          src={HANDICAP_LOOKUP_EMBED_URL}
          title="Consulta de Handicap Federado"
          className="h-[720px] w-full"
        />
      </div>
    </div>
  )
}
