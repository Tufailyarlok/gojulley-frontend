// Star rating — read-only for display, or interactive when onChange is given.
export default function Stars({
  value,
  size = 16,
  onChange,
}: {
  value: number
  size?: number
  onChange?: (v: number) => void
}) {
  const interactive = !!onChange
  return (
    <span style={{ display: 'inline-flex', gap: 1, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (interactive ? value : Math.round(value))
        return (
          <span
            key={s}
            onClick={onChange ? () => onChange(s) : undefined}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `${s} star${s > 1 ? 's' : ''}` : undefined}
            style={{
              color: filled ? '#f5a623' : '#d6d6da',
              fontSize: size,
              cursor: interactive ? 'pointer' : 'default',
            }}
          >
            ★
          </span>
        )
      })}
    </span>
  )
}
