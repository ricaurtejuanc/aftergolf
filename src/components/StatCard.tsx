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
        accent
          ? 'border-fairway-400 bg-fairway-400/10'
          : 'border-fairway-800 bg-fairway-900/40'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-fairway-300">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accent ? 'text-fairway-200' : 'text-white'}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-fairway-400">{hint}</div>}
    </div>
  )
}
