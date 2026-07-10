import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createTripBooking, createTripPaymentOrder, getCoupons, getListings, getTrip, previewCoupon, verifyTripPayment } from '../api'
import { useAuth } from '../auth'
import { payWithRazorpay } from '../razorpay'
import { tripPhoto } from '../photos'
import ServiceStrip from '../components/ServiceStrip'
import DateField from '../components/DateField'
import type { Listing, PublicCoupon, TripPackage } from '../types'

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [offers, setOffers] = useState<PublicCoupon[]>([])
  const [allListings, setAllListings] = useState<Listing[]>([])

  useEffect(() => {
    if (!id) return
    getTrip(Number(id))
      .then(setTrip)
      .catch((e) => setError((e as Error).message))
  }, [id])

  useEffect(() => {
    getListings().then(setAllListings).catch(() => {})
  }, [])

  // Add-on services bookable alongside the package (trip-wide helpers).
  const services = useMemo(() => allListings.filter((l) => l.type === 'SERVICE'), [allListings])

  useEffect(() => {
    if (!user) return
    getCoupons(user.token)
      .then(setOffers)
      .catch(() => {})
  }, [user])

  const total = useMemo(() => (trip ? trip.pricePerPerson * travelers : 0), [trip, travelers])

  function resetCoupon() {
    setDiscount(0)
    setCouponMsg(null)
  }

  async function applyCode(code: string, amount = total) {
    if (!user || !trip || !code) return
    setCouponMsg(null)
    setApplying(true)
    try {
      const p = await previewCoupon(user.token, code, amount)
      setDiscount(p.discount)
      setCouponMsg(p.message)
    } catch (err) {
      setDiscount(0)
      setCouponMsg((err as Error).message)
    } finally {
      setApplying(false)
    }
  }

  async function bookAndPay() {
    if (!user) {
      navigate('/login')
      return
    }
    if (!startDate || startDate < todayISO()) {
      setError('Pick a start date that isn’t in the past.')
      return
    }
    if (!trip) return
    setError(null)
    setBusy(true)
    try {
      const booking = await createTripBooking(user.token, { packageId: trip.id, startDate, travelers })
      const order = await createTripPaymentOrder(user.token, booking.id, coupon.trim() || undefined)
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

      <div style={{ marginTop: 14, borderRadius: 16, overflow: 'hidden', aspectRatio: '21 / 9', background: 'var(--surface)' }}>
        <img src={tripPhoto(trip)} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

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
                  <DateField value={startDate} onChange={setStartDate} min={todayISO()} placeholder="Pick a start date" ariaLabel="Trip start date" />
                </label>
                <label className="label" style={{ flex: 1 }}>
                  Travellers
                  <input
                    className="field"
                    type="number"
                    min={1}
                    value={travelers}
                    onChange={(e) => {
                      const t = Math.max(1, Number(e.target.value))
                      setTravelers(t)
                      if (coupon && trip) applyCode(coupon, trip.pricePerPerson * t)
                      else resetCoupon()
                    }}
                  />
                </label>
              </div>

              {offers.length > 0 && (
                <label className="label">
                  Coupon
                  <select
                    className="field"
                    value={coupon}
                    onChange={(e) => {
                      const code = e.target.value
                      setCoupon(code)
                      if (code) applyCode(code)
                      else resetCoupon()
                    }}
                  >
                    <option value="">No coupon</option>
                    {offers.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.code} — {o.description}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {(applying || couponMsg) && (
                <p className="section-sub" style={{ margin: '6px 0 0', color: applying ? 'var(--faint)' : discount > 0 ? 'var(--ok)' : 'var(--danger)' }}>
                  {applying ? 'Checking…' : couponMsg}
                </p>
              )}

              <div className="summary" style={{ marginTop: 10 }}>
                {inr(trip.pricePerPerson)} × {travelers} = {inr(total)}
                {discount > 0 && (
                  <>
                    {' '}· <span style={{ color: 'var(--ok)' }}>− {inr(discount)}</span>
                  </>
                )}{' '}
                · <strong style={{ color: 'var(--ink)' }}>Pay {inr(total - discount)}</strong>
              </div>
              {error && <p className="alert alert-error" style={{ marginTop: 12 }}>{error}</p>}
              <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} disabled={busy} onClick={bookAndPay}>
                {busy ? 'Processing…' : user ? `Book & pay ${inr(total - discount)}` : 'Log in to book'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <ServiceStrip
          title="Add services to your trip"
          subtitle="A local guide, photographer, on-call mechanic or coordinator — book alongside this package."
          services={services}
        />
      </div>
    </div>
  )
}
