import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createBooking, getAvailability } from '../api'
import { useAuth } from '../auth'
import { addDays, todayISO } from '../dates'
import DateField from './DateField'
import type { Listing } from '../types'

export default function BookingModal({
  listing,
  onClose,
  onBooked,
  initialStart = '',
  initialEnd = '',
  initialQuantity = 1,
}: {
  listing: Listing
  onClose: () => void
  onBooked: () => void
  initialStart?: string
  initialEnd?: string
  initialQuantity?: number
}) {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)
  const [quantity, setQuantity] = useState(Math.max(1, initialQuantity))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Per-date availability for the chosen window (null = not looked up yet).
  const [available, setAvailable] = useState<number | null>(null)
  const [availBusy, setAvailBusy] = useState(false)

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    return ms > 0 ? Math.round(ms / 86_400_000) : 0
  }, [startDate, endDate])

  const total = nights * listing.pricePerDay * quantity
  const today = todayISO()

  // Look up how many units are actually free for these dates (derived server-side).
  useEffect(() => {
    if (nights < 1) {
      setAvailable(null)
      return
    }
    let cancelled = false
    setAvailBusy(true)
    getAvailability(listing.id, startDate, endDate)
      .then((a) => {
        if (cancelled) return
        setAvailable(a.available)
        setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, a.available)))
      })
      .catch(() => {
        if (!cancelled) setAvailable(null) // fall back silently; server still enforces on submit
      })
      .finally(() => {
        if (!cancelled) setAvailBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [listing.id, startDate, endDate, nights])

  const soldOut = available === 0

  function onStart(v: string) {
    setStartDate(v)
    if (endDate && endDate <= v) setEndDate('')
  }
  function onEnd(v: string) {
    setEndDate(v)
    if (startDate && v <= startDate) setStartDate('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!startDate || startDate < today) {
      setError('Check-in can’t be in the past.')
      return
    }
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
    <div onClick={onClose} className="modal-backdrop">
      <div onClick={(e) => e.stopPropagation()} className="modal-card">
        <h3 style={{ marginTop: 0, marginBottom: 2 }}>Book · {listing.title}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0 }}>
          {listing.location} · ₹{listing.pricePerDay.toLocaleString('en-IN')}/day
        </p>

        <form onSubmit={submit}>
          <div className="form-row">
            <label className="label" style={{ flex: 1 }}>
              Check-in
              <DateField
                value={startDate}
                onChange={onStart}
                min={today}
                max={endDate ? addDays(endDate, -1) : undefined}
                placeholder="Check-in"
                ariaLabel="Check-in date"
              />
            </label>
            <label className="label" style={{ flex: 1 }}>
              Check-out
              <DateField
                value={endDate}
                onChange={onEnd}
                min={startDate ? addDays(startDate, 1) : addDays(today, 1)}
                placeholder="Check-out"
                ariaLabel="Check-out date"
              />
            </label>
          </div>

          <label className="label">
            Quantity
            <input
              className="field"
              type="number"
              min={1}
              max={available ?? listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </label>

          {nights > 0 && (
            <p style={{ fontSize: 13, margin: '2px 0 0', color: soldOut ? 'var(--danger)' : 'var(--muted)' }}>
              {availBusy
                ? 'Checking availability…'
                : available == null
                  ? ''
                  : soldOut
                    ? 'No units available for these dates.'
                    : `${available} of ${listing.quantity} available for these dates.`}
            </p>
          )}

          <div className="summary">
            {nights > 0 ? (
              <>
                {nights} night{nights > 1 ? 's' : ''} × ₹{listing.pricePerDay.toLocaleString('en-IN')} × {quantity} ={' '}
                <strong style={{ color: 'var(--ink)' }}>₹{total.toLocaleString('en-IN')}</strong>
              </>
            ) : (
              <span style={{ color: 'var(--muted)' }}>Pick dates to see the total.</span>
            )}
          </div>

          {error && <p className="alert alert-error" style={{ marginTop: 14 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={busy || soldOut || quantity > (available ?? Infinity)} className="btn btn-primary">
              {busy ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
