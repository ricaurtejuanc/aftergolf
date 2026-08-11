interface Props {
  label: string
  value: string | number
  hint?: string
  accent?: boolean
}

export function StatCard({ label, value, hint, accent }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? 'border-gold-400 bg-gold-400/10' : 'border-cream-300 bg-white'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-fairway-500">{label}</div>
      <div
        className={`mt-1 text-3xl font-semibold ${accent ? 'text-fairway-800' : 'text-fairway-900'}`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-fairway-500">{hint}</div>}
    </div>
  )
}
