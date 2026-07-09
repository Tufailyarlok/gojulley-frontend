import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createBooking, createReview, getReviews } from '../api'
import { useAuth } from '../auth'
import Stars from './Stars'
import type { Listing, Review } from '../types'

// Local-timezone yyyy-mm-dd (avoids the UTC off-by-one from toISOString()).
function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  return localISO(new Date(y, m - 1, d + n))
}

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [revBusy, setRevBusy] = useState(false)
  const [revError, setRevError] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    return ms > 0 ? Math.round(ms / 86_400_000) : 0
  }, [startDate, endDate])

  const total = nights * listing.pricePerDay * quantity
  const today = localISO(new Date())

  useEffect(() => {
    getReviews(listing.id)
      .then(setReviews)
      .catch(() => {})
  }, [listing.id])

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  async function submitReview() {
    if (!user || rating === 0) return
    setRevBusy(true)
    setRevError(null)
    try {
      const r = await createReview(user.token, { listingId: listing.id, rating, comment })
      setReviews((rs) => [r, ...rs])
      setPosted(true)
    } catch (err) {
      setRevError((err as Error).message)
    } finally {
      setRevBusy(false)
    }
  }

  // Works whichever date is picked first: setting check-in clears a now-invalid
  // check-out and vice-versa. The min/max on the inputs block past dates and
  // wrong ordering in the native picker; these guards handle typed values.
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
          {listing.location} · ₹{listing.pricePerDay.toLocaleString('en-IN')}/day · {listing.quantity} available
        </p>

        <form onSubmit={submit}>
          <div className="form-row">
            <label className="label" style={{ flex: 1 }}>
              Check-in
              <input
                className="field"
                type="date"
                min={today}
                max={endDate ? addDays(endDate, -1) : undefined}
                value={startDate}
                onChange={(e) => onStart(e.target.value)}
                required
              />
            </label>
            <label className="label" style={{ flex: 1 }}>
              Check-out
              <input
                className="field"
                type="date"
                min={startDate ? addDays(startDate, 1) : addDays(today, 1)}
                value={endDate}
                onChange={(e) => onEnd(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="label">
            Quantity
            <input
              className="field"
              type="number"
              min={1}
              max={listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </label>

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
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>

        <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 15 }}>Reviews</h4>
            {reviews.length > 0 && (
              <>
                <Stars value={avg} size={14} />
                <span style={{ fontSize: 13, color: 'var(--faint)' }}>{avg.toFixed(1)} · {reviews.length}</span>
              </>
            )}
          </div>

          {reviews.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--faint)', margin: '0 0 10px' }}>No reviews yet — be the first.</p>
          )}

          {reviews.length > 0 && (
            <div style={{ display: 'grid', gap: 10, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ background: 'var(--surface)', borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13 }}>{r.userName}</strong>
                    <Stars value={r.rating} size={12} />
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {!user ? (
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>Log in to write a review.</p>
          ) : posted ? (
            <p style={{ fontSize: 13, color: 'var(--ok)', fontWeight: 700 }}>Thanks for your review!</p>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Your rating</span>
                <Stars value={rating} size={22} onChange={setRating} />
              </div>
              <textarea
                className="field"
                style={{ minHeight: 56, resize: 'vertical' }}
                placeholder="Share a few words (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {revError && <p className="alert alert-error" style={{ marginTop: 8 }}>{revError}</p>}
              <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} disabled={revBusy || rating === 0} onClick={submitReview}>
                {revBusy ? 'Posting…' : 'Post review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
