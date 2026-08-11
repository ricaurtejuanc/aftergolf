interface Props {
  className?: string
  variant?: 'mark' | 'full'
}

/**
 * Recreated approximation of the AfterGolf crest (flag + beer mug shield,
 * laurel wreath, serif wordmark) — not a pixel copy of the source artwork.
 */
export function Logo({ className, variant = 'mark' }: Props) {
  return (
    <svg
      viewBox={variant === 'full' ? '0 0 240 300' : '0 0 240 232'}
      className={className}
      role="img"
      aria-label="AfterGolf"
    >
      <defs>
        <linearGradient id="ag-mug" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7bf6a" />
          <stop offset="100%" stopColor="#c9973f" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M120,8 C150,8 180,20 192,34 L192,112 C192,164 162,200 120,220 C78,200 48,164 48,112 L48,34 C60,20 90,8 120,8 Z"
        fill="#efe6cf"
        stroke="#b3894a"
        strokeWidth="6"
      />
      <path
        d="M120,16 C146,16 172,27 182,39 L182,112 C182,158 156,190 120,208 C84,190 58,158 58,112 L58,39 C68,27 94,16 120,16 Z"
        fill="none"
        stroke="#c9a35f"
        strokeWidth="2"
      />

      {/* Center divider */}
      <line x1="120" y1="30" x2="120" y2="196" stroke="#c9a35f" strokeWidth="2" />

      {/* Flag + green (left half) */}
      <ellipse cx="90" cy="176" rx="20" ry="6" fill="#1c6134" />
      <line x1="90" y1="176" x2="90" y2="66" stroke="#164026" strokeWidth="4" strokeLinecap="round" />
      <path d="M90,66 L124,80 L90,96 Z" fill="#1c6134" />

      {/* Beer mug (right half) */}
      <rect x="132" y="90" width="34" height="56" rx="6" fill="url(#ag-mug)" stroke="#164026" strokeWidth="4" />
      <path
        d="M166,100 C180,100 182,120 166,124"
        fill="none"
        stroke="#164026"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M132,96 C138,86 160,86 166,96 C166,102 132,102 132,96 Z" fill="#f6f1e3" stroke="#164026" strokeWidth="2" />

      {/* Laurel */}
      <g stroke="#b3894a" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M70,196 C64,204 62,212 66,220" />
        <path d="M66,220 C60,220 55,224 54,230" />
        <path d="M66,220 C72,222 76,226 76,232" />
        <path d="M170,196 C176,204 178,212 174,220" />
        <path d="M174,220 C180,220 185,224 186,230" />
        <path d="M174,220 C168,222 164,226 164,232" />
      </g>

      {variant === 'full' && (
        <text
          x="120"
          y="256"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="34"
          letterSpacing="2"
          fill="#164026"
        >
          AFTERGOLF
        </text>
      )}
    </svg>
  )
}
