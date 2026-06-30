import { useMemo, useState, type FormEvent } from 'react'
import { createBooking } from '../api'
import { useAuth } from '../auth'
import type { Listing } from '../types'

const field = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  marginTop: 4,
  fontSize: 14,
} as const

export default function BookingModal({
  listing,
  onClose,
  onBooked,
}: {
  listing: Listing
  onClose: () => void
  onBooked: () => void
}) {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    return ms > 0 ? Math.round(ms / 86_400_000) : 0
  }, [startDate, endDate])

  const total = nights * listing.pricePerDay * quantity

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (nights < 1) {
      setError('Check-out must be after check-in.')
      return
    }
    if (!user) return
    setBusy(true)
    try {
      await createBooking(user.token, { listingId: listing.id, startDate, endDate, quantity })
      onBooked()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 420 }}
      >
        <h3 style={{ marginTop: 0 }}>Book · {listing.title}</h3>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0 }}>
          {listing.location} · ₹{listing.pricePerDay.toLocaleString('en-IN')}/day · {listing.quantity} available
        </p>

        <form onSubmit={submit}>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, fontSize: 14 }}>
              Check-in
              <input style={field} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label style={{ flex: 1, fontSize: 14 }}>
              Check-out
              <input style={field} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          </div>

          <label style={{ display: 'block', fontSize: 14, marginTop: 12 }}>
            Quantity
            <input
              style={field}
              type="number"
              min={1}
              max={listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </label>

          <div style={{ marginTop: 16, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 14 }}>
            {nights > 0 ? (
              <>
                {nights} night{nights > 1 ? 's' : ''} × ₹{listing.pricePerDay.toLocaleString('en-IN')} × {quantity} ={' '}
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </>
            ) : (
              <span style={{ color: '#6b7280' }}>Pick dates to see the total.</span>
            )}
          </div>

          {error && <p style={{ color: 'crimson', fontSize: 14 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
            >
              {busy ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
