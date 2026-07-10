import type { ChangeEvent } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pretty(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/**
 * A styled date field: a proper bordered control with a calendar icon and a
 * placeholder, showing the picked date nicely formatted (e.g. "3 Jul 2026").
 * The real <input type="date"> sits transparently on top, so tapping anywhere
 * opens the native picker — which is the best experience on mobile.
 */
export default function DateField({
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  ariaLabel?: string
}) {
  return (
    <div className="datefield">
      <svg className="datefield-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <span className={value ? 'datefield-text' : 'datefield-ph'}>{value ? pretty(value) : placeholder}</span>
      <input
        className="datefield-native"
        type="date"
        value={value}
        min={min}
        max={max}
        aria-label={ariaLabel ?? placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  )
}
