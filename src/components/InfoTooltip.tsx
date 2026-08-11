import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLSpanElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !popupRef.current) return
    const btn = buttonRef.current.getBoundingClientRect()
    const popupWidth = popupRef.current.offsetWidth
    const margin = 12
    const left = Math.max(
      margin,
      Math.min(btn.left + btn.width / 2 - popupWidth / 2, window.innerWidth - popupWidth - margin),
    )
    setPosition({ left, top: btn.bottom + 8 })
  }, [open])

  useEffect(() => {
    if (!open) return
    function close() {
      setOpen(false)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Más información"
        aria-expanded={open}
        className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-fairway-400 align-middle text-fairway-600 transition hover:border-fairway-600 hover:text-fairway-800"
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
        <span
          ref={popupRef}
          style={
            position
              ? { left: position.left, top: position.top }
              : { top: -9999, left: -9999 }
          }
          className="fixed z-30 w-64 max-w-[calc(100vw-1.5rem)] rounded-lg border border-cream-300 bg-white p-3 text-xs font-normal leading-relaxed text-fairway-700 shadow-lg"
        >
          {text}
        </span>
      )}
    </>
  )
}
