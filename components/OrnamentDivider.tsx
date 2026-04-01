'use client'

interface OrnamentDividerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export default function OrnamentDivider({ className = '', size = 'md', animate = true }: OrnamentDividerProps) {
  const widths = { sm: 200, md: 320, lg: 480 }
  const w = widths[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={w}
        viewBox="0 0 320 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'ornament-glow' : ''}
      >
        {/* Left filigree scroll */}
        <g fill="#C9A84C">
          {/* Main left curl */}
          <path d="M130 30 C120 20, 105 18, 95 25 C85 32, 88 42, 98 40 C105 38, 107 32, 102 30 C98 28, 95 32, 98 34" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          {/* Secondary left curl */}
          <path d="M125 30 C115 15, 95 12, 80 22 C70 28, 72 40, 82 38 C90 36, 93 28, 86 26" stroke="#C9A84C" strokeWidth="1" fill="none" strokeLinecap="round"/>
          {/* Outer left curl */}
          <path d="M118 30 C105 10, 78 8, 62 20 C52 28, 55 42, 67 40 C76 38, 79 28, 72 25" stroke="#C9A84C" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          {/* Small top left flourish */}
          <path d="M110 28 C108 22, 112 18, 116 22 C118 25, 115 28, 112 27" stroke="#C9A84C" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Small bottom left flourish */}
          <path d="M110 32 C108 38, 112 42, 116 38 C118 35, 115 32, 112 33" stroke="#C9A84C" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          {/* Left dot accents */}
          <circle cx="62" cy="30" r="1.5"/>
          <circle cx="75" cy="22" r="1"/>
          <circle cx="75" cy="38" r="1"/>
        </g>

        {/* Right filigree scroll (mirrored) */}
        <g fill="#C9A84C" transform="translate(320,0) scale(-1,1)">
          <path d="M130 30 C120 20, 105 18, 95 25 C85 32, 88 42, 98 40 C105 38, 107 32, 102 30 C98 28, 95 32, 98 34" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M125 30 C115 15, 95 12, 80 22 C70 28, 72 40, 82 38 C90 36, 93 28, 86 26" stroke="#C9A84C" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <path d="M118 30 C105 10, 78 8, 62 20 C52 28, 55 42, 67 40 C76 38, 79 28, 72 25" stroke="#C9A84C" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          <path d="M110 28 C108 22, 112 18, 116 22 C118 25, 115 28, 112 27" stroke="#C9A84C" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M110 32 C108 38, 112 42, 116 38 C118 35, 115 32, 112 33" stroke="#C9A84C" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <circle cx="62" cy="30" r="1.5"/>
          <circle cx="75" cy="22" r="1"/>
          <circle cx="75" cy="38" r="1"/>
        </g>

        {/* Center diamond gem */}
        <g transform="translate(160,30)">
          {/* Diamond shape */}
          <polygon points="0,-10 8,-2 0,10 -8,-2" fill="url(#diamondGrad)" opacity="0.95"/>
          <polygon points="0,-10 8,-2 0,2 -8,-2" fill="url(#diamondTop)" opacity="0.7"/>
          {/* Sparkle lines */}
          <line x1="0" y1="-14" x2="0" y2="-11" stroke="#E8C97A" strokeWidth="0.8" opacity="0.8"/>
          <line x1="12" y1="-4" x2="9" y2="-3" stroke="#E8C97A" strokeWidth="0.8" opacity="0.8"/>
          <line x1="-12" y1="-4" x2="-9" y2="-3" stroke="#E8C97A" strokeWidth="0.8" opacity="0.8"/>
        </g>

        {/* Horizontal lines flanking center */}
        <line x1="135" y1="30" x2="148" y2="30" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>
        <line x1="172" y1="30" x2="185" y2="30" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6"/>

        <defs>
          <linearGradient id="diamondGrad" x1="0" y1="-10" x2="0" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8C97A"/>
            <stop offset="50%" stopColor="#C9A84C"/>
            <stop offset="100%" stopColor="#9A7A2E"/>
          </linearGradient>
          <linearGradient id="diamondTop" x1="0" y1="-10" x2="0" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF5CC" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#E8C97A" stopOpacity="0.3"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
