import { useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Más información"
        aria-expanded={open}
        className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-fairway-400 text-fairway-600 transition hover:border-fairway-600 hover:text-fairway-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="h-2.5 w-2.5"
        >
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open && (
        <span className="absolute right-0 top-full z-30 mt-2 w-64 max-w-[85vw] rounded-lg border border-cream-300 bg-white p-3 text-xs font-normal leading-relaxed text-fairway-700 shadow-lg">
          {text}
        </span>
      )}
    </span>
  )
}
