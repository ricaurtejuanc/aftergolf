import { useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Más información"
        aria-expanded={open}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-fairway-400 text-[10px] font-semibold leading-none text-fairway-600 transition hover:border-fairway-600 hover:text-fairway-800"
      >
        i
      </button>
      {open && (
        <span className="absolute right-0 top-full z-30 mt-2 w-64 max-w-[85vw] rounded-lg border border-cream-300 bg-white p-3 text-xs font-normal leading-relaxed text-fairway-700 shadow-lg">
          {text}
        </span>
      )}
    </span>
  )
}
