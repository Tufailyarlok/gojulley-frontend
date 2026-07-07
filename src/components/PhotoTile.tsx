import { useId, type ReactNode } from 'react'

// Stylized gradient + mountain-ridge "photo" for cards. Real photos would slot
// in here later (image field on listings/trips); until then these read as
// tasteful placeholders keyed to a colour theme.
type Theme = 'blue' | 'green' | 'amber' | 'purple' | 'teal' | 'slate'

const THEMES: Record<Theme, [string, string]> = {
  blue: ['#3b6fd0', '#17306b'],
  green: ['#34a76b', '#15603c'],
  amber: ['#e0a53c', '#8a5510'],
  purple: ['#a05bd6', '#5a2091'],
  teal: ['#2ea6c9', '#0e4f66'],
  slate: ['#5b6b86', '#2b3547'],
}

export default function PhotoTile({
  theme = 'blue',
  sun = false,
  children,
}: {
  theme?: Theme
  sun?: boolean
  children?: ReactNode
}) {
  const id = useId().replace(/:/g, '')
  const [c1, c2] = THEMES[theme]
  return (
    <div className="photo">
      <svg viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill={`url(#${id})`} />
        {sun && <circle cx="312" cy="58" r="24" fill="#ffe9a8" opacity="0.85" />}
        <polygon points="0,250 0,150 110,95 220,160 300,110 400,150 400,250" fill="#0e2450" opacity="0.55" />
        <polygon points="0,250 0,200 140,150 260,205 360,165 400,190 400,250" fill="#0a1c40" opacity="0.9" />
      </svg>
      {children}
    </div>
  )
}
