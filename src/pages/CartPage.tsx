import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartCheckout, createTripPaymentOrder, verifyTripPayment } from '../api'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import { todayISO } from '../dates'
import { TYPE_META, inr } from '../listingMeta'
import { payWithRazorpay } from '../razorpay'

export default function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, setQty, remove, clear } = useCart()

  const today = todayISO()
  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState(2)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const perDay = items.reduce((sum, i) => sum + i.pricePerDay * i.quantity, 0)
  const total = perDay * days

  async function checkout() {
    if (!user) {
      navigate('/login')
      return
    }
    if (!startDate || startDate < today) {
      setError('Pick a start date that isn’t in the past.')
      return
    }
    if (days < 1) {
      setError('Your trip must be at least 1 day.')
      return
    }
    if (!items.length) return
    setError(null)
    setBusy(true)
    try {
      const order = await cartCheckout(user.token, {
        startDate,
        days,
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
      })
      const payOrder = await createTripPaymentOrder(user.token, order.id)
      await payWithRazorpay({
        order: payOrder,
        user: { email: user.email, name: user.name },
        description: `GoJulley cart · ${items.length} item${items.length > 1 ? 's' : ''}`,
        verify: (r) => verifyTripPayment(user.token, r),
        onSuccess: () => {
          clear()
          setDone(true)
        },
        onError: (m) => setError(m),
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="page" style={{ maxWidth: 720, paddingTop: '2.5rem' }}>
        <div className="alert alert-success">
          Booked &amp; confirmed! Everything in your cart is reserved. See it under{' '}
          <Link to="/bookings">My bookings</Link>.
        </div>
        <Link to="/search?tab=stays" className="btn btn-primary" style={{ marginTop: 16 }}>Plan another</Link>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 860, paddingTop: '2rem' }}>
      <span className="eyebrow">Your trip</span>
      <h2 className="section-title">Your cart</h2>
      <p className="section-sub" style={{ marginBottom: 20 }}>
        Everything you picked, booked and paid together — one trip window (10 AM to next-day 10 AM), applied to each item.
      </p>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--faint)', margin: '0 0 14px' }}>Your cart is empty.</p>
          <Link to="/search?tab=stays" className="btn btn-primary">Browse stays, rides &amp; services</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20 }}>
          <div className="card" style={{ display: 'grid', gap: 14 }}>
            {items.map((i) => {
              const meta = TYPE_META[i.type]
              return (
                <div key={i.listingId} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                  <span className="type-badge" style={{ background: meta.tint, color: meta.ink }}>{meta.badge}</span>
                  <Link to={`/listings/${i.listingId}`} style={{ fontWeight: 700, color: 'var(--ink)', flex: '1 1 160px' }}>{i.title}</Link>
                  <span style={{ color: 'var(--faint)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{inr(i.pricePerDay)}/day</span>
                  <label className="label" style={{ margin: 0, flex: '0 0 auto' }}>
                    <span style={{ fontSize: 11 }}>Qty</span>
                    <input
                      className="field"
                      type="number"
                      min={1}
                      value={i.quantity}
                      onChange={(e) => setQty(i.listingId, Math.max(1, Number(e.target.value)))}
                      style={{ width: 68 }}
                    />
                  </label>
                  <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => remove(i.listingId)}>Remove</button>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label className="label" style={{ margin: 0, flex: '1 1 180px' }}>
              Trip start date
              <input className="field" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="label" style={{ margin: 0, flex: '0 1 140px' }}>
              Number of days
              <input className="field" type="number" min={1} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value)))} />
            </label>
          </div>

          <div className="card">
            <div className="summary" style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>{inr(perDay)} / day</span>
                <span>× {days} day{days > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                <span>Total</span>
                <span>{inr(total)}</span>
              </div>
            </div>
            {error && <p className="alert alert-error" style={{ marginBottom: 12 }}>{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy} onClick={checkout}>
              {busy ? 'Processing…' : user ? `Book & pay ${inr(total)}` : 'Log in to book'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
