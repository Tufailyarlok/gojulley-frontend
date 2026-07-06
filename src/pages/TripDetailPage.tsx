import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createTripBooking, createTripPaymentOrder, getTrip, verifyTripPayment } from '../api'
import { useAuth } from '../auth'
import { payWithRazorpay } from '../razorpay'
import type { TripPackage } from '../types'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function TripDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<TripPackage | null>(null)
  const [startDate, setStartDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!id) return
    getTrip(Number(id))
      .then(setTrip)
      .catch((e) => setError((e as Error).message))
  }, [id])

  const total = useMemo(() => (trip ? trip.pricePerPerson * travelers : 0), [trip, travelers])

  async function bookAndPay() {
    if (!user) {
      navigate('/login')
      return
    }
    if (!startDate) {
      setError('Pick a start date.')
      return
    }
    if (!trip) return
    setError(null)
    setBusy(true)
    try {
      const booking = await createTripBooking(user.token, { packageId: trip.id, startDate, travelers })
      const order = await createTripPaymentOrder(user.token, booking.id)
      await payWithRazorpay({
        order,
        user: { email: user.email, name: user.name },
        description: trip.title,
        verify: (r) => verifyTripPayment(user.token, r),
        onSuccess: () => setDone(true),
        onError: (m) => setError(m),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !trip) {
    return (
      <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
        <p className="alert alert-error">{error}</p>
        <Link to="/trips">← All trips</Link>
      </div>
    )
  }
  if (!trip) {
    return <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1rem', color: 'var(--muted)' }}>Loading…</div>
  }

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/trips" className="btn btn-outline" style={{ marginBottom: 16 }}>
        ← All trips
      </Link>
      <div>
        <span className="type-badge">
          {trip.durationDays} days · {trip.route}
        </span>
      </div>
      <h2 className="section-title" style={{ margin: '8px 0 4px' }}>{trip.title}</h2>
      <p className="section-sub" style={{ marginTop: 0 }}>{trip.summary}</p>

      <div style={{ display: 'grid', gap: 20, marginTop: 12 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Day by day</h3>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {trip.itinerary.map((d, i) => (
              <li key={i} style={{ color: 'var(--ink)' }}>{d}</li>
            ))}
          </ol>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Included</h3>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
              {trip.included.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Not included</h3>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4, color: 'var(--muted)' }}>
              {trip.notIncluded.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>What&rsquo;s inside</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {trip.items.map((it) => (
              <span key={it.listingId} className="badge badge-confirmed">
                {it.listingTitle}
                {it.quantity > 1 ? ` ×${it.quantity}` : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Book this trip</h3>
          {done ? (
            <div className="alert alert-success">
              Trip booked &amp; confirmed! See it under <Link to="/bookings">My bookings</Link>.
            </div>
          ) : (
            <>
              <div className="form-row">
                <label className="label" style={{ flex: 1 }}>
                  Start date
                  <input
                    className="field"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </label>
                <label className="label" style={{ flex: 1 }}>
                  Travellers
                  <input
                    className="field"
                    type="number"
                    min={1}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                  />
                </label>
              </div>
              <div className="summary">
                {inr(trip.pricePerPerson)} × {travelers} ={' '}
                <strong style={{ color: 'var(--ink)' }}>{inr(total)}</strong>
              </div>
              {error && <p className="alert alert-error" style={{ marginTop: 12 }}>{error}</p>}
              <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={busy} onClick={bookAndPay}>
                {busy ? 'Processing…' : user ? `Book & pay ${inr(total)}` : 'Log in to book'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
