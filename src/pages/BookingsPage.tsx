import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  cancelBooking,
  cancelTripBooking,
  createPaymentOrder,
  createTripPaymentOrder,
  getMyBookings,
  getMyTrips,
  verifyPayment,
  verifyTripPayment,
} from '../api'
import { useAuth } from '../auth'
import { payWithRazorpay } from '../razorpay'
import type { Booking, TripBooking } from '../types'

const statusBadge: Record<Booking['status'], string> = {
  PENDING: 'badge badge-pending',
  CONFIRMED: 'badge badge-confirmed',
  CANCELLED: 'badge badge-cancelled',
}
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [trips, setTrips] = useState<TripBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([getMyBookings(user.token), getMyTrips(user.token)])
      .then(([b, t]) => {
        setBookings(b)
        setTrips(t)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem', color: 'var(--muted)' }}>
        Please <Link to="/login">log in</Link> to see your bookings.
      </div>
    )
  }

  // --- Trips ---
  function patchTrip(id: number, patch: Partial<TripBooking>) {
    setTrips((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }
  async function payTrip(t: TripBooking) {
    setBusyKey(`trip-${t.id}`)
    setError(null)
    setNotice(null)
    try {
      const order = await createTripPaymentOrder(user!.token, t.id, coupons[`trip-${t.id}`]?.trim() || undefined)
      await payWithRazorpay({
        order,
        user: { email: user!.email, name: user!.name },
        description: t.packageTitle,
        verify: (r) => verifyTripPayment(user!.token, r),
        onSuccess: () => {
          patchTrip(t.id, { status: 'CONFIRMED' })
          if (order.discount > 0) setNotice(`Paid — saved ${inr(order.discount / 100)} with ${order.couponCode}.`)
        },
        onError: (m) => setError(m),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function cancelTrip(id: number) {
    setBusyKey(`trip-${id}`)
    setError(null)
    try {
      const updated = await cancelTripBooking(user!.token, id)
      patchTrip(id, { status: updated.status })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyKey(null)
    }
  }

  // --- Individual bookings ---
  function patchBooking(id: number, patch: Partial<Booking>) {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }
  async function payBooking(b: Booking) {
    setBusyKey(`bk-${b.id}`)
    setError(null)
    setNotice(null)
    try {
      const order = await createPaymentOrder(user!.token, b.id, coupons[`bk-${b.id}`]?.trim() || undefined)
      await payWithRazorpay({
        order,
        user: { email: user!.email, name: user!.name },
        description: b.listingTitle,
        verify: (r) => verifyPayment(user!.token, r),
        onSuccess: () => {
          patchBooking(b.id, { status: 'CONFIRMED' })
          if (order.discount > 0) setNotice(`Paid — saved ${inr(order.discount / 100)} with ${order.couponCode}.`)
        },
        onError: (m) => setError(m),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyKey(null)
    }
  }
  async function cancelBk(id: number) {
    setBusyKey(`bk-${id}`)
    setError(null)
    try {
      const updated = await cancelBooking(user!.token, id)
      patchBooking(id, { status: updated.status })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <h2 className="section-title" style={{ margin: 0 }}>My bookings</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/trips" className="btn btn-outline">Trips</Link>
          <Link to="/" className="btn btn-outline">Listings</Link>
        </div>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
      {notice && <div className="alert alert-success" style={{ marginBottom: 14 }}>{notice}</div>}

      {trips.length > 0 && (
        <>
          <h3 style={{ margin: '8px 0 10px' }}>Trips</h3>
          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
            {trips.map((t) => (
              <div key={t.id} className="card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong style={{ fontSize: 15 }}>{t.packageTitle}</strong>
                    <span className={statusBadge[t.status]}>{t.status}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                    Starts {t.startDate} · {t.travelers} traveller(s) · {inr(t.totalPrice)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {t.status === 'PENDING' && (
                    <input
                      className="field"
                      style={{ width: 120, margin: 0, padding: '8px 10px' }}
                      placeholder="Coupon"
                      value={coupons[`trip-${t.id}`] ?? ''}
                      onChange={(e) => setCoupons((c) => ({ ...c, [`trip-${t.id}`]: e.target.value }))}
                    />
                  )}
                  {t.status === 'PENDING' && (
                    <button onClick={() => payTrip(t)} disabled={busyKey === `trip-${t.id}`} className="btn btn-primary">
                      {busyKey === `trip-${t.id}` ? 'Processing…' : `Pay ${inr(t.totalPrice)}`}
                    </button>
                  )}
                  {t.status !== 'CANCELLED' && (
                    <button onClick={() => cancelTrip(t.id)} disabled={busyKey === `trip-${t.id}`} className="btn btn-danger">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {bookings.length > 0 && <h3 style={{ margin: '8px 0 10px' }}>Individual bookings</h3>}
      <div style={{ display: 'grid', gap: 12 }}>
        {bookings.map((b) => (
          <div key={b.id} className="card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong style={{ fontSize: 15 }}>{b.listingTitle}</strong>
                <span className={statusBadge[b.status]}>{b.status}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                {b.startDate} → {b.endDate} · {b.quantity} unit(s) · {inr(b.totalPrice)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {b.status === 'PENDING' && (
                <input
                  className="field"
                  style={{ width: 120, margin: 0, padding: '8px 10px' }}
                  placeholder="Coupon"
                  value={coupons[`bk-${b.id}`] ?? ''}
                  onChange={(e) => setCoupons((c) => ({ ...c, [`bk-${b.id}`]: e.target.value }))}
                />
              )}
              {b.status === 'PENDING' && (
                <button onClick={() => payBooking(b)} disabled={busyKey === `bk-${b.id}`} className="btn btn-primary">
                  {busyKey === `bk-${b.id}` ? 'Processing…' : `Pay ${inr(b.totalPrice)}`}
                </button>
              )}
              {b.status !== 'CANCELLED' && (
                <button onClick={() => cancelBk(b.id)} disabled={busyKey === `bk-${b.id}`} className="btn btn-danger">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && bookings.length === 0 && trips.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          No bookings yet. <Link to="/trips">Browse trips →</Link> or <Link to="/">individual listings →</Link>
        </p>
      )}
    </div>
  )
}
