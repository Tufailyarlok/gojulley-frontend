import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, createPaymentOrder, getMyBookings, verifyPayment } from '../api'
import { useAuth } from '../auth'
import type { Booking } from '../types'

const statusBadge: Record<Booking['status'], string> = {
  PENDING: 'badge badge-pending',
  CONFIRMED: 'badge badge-confirmed',
  CANCELLED: 'badge badge-cancelled',
}

// Load Razorpay's checkout script on demand (once).
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getMyBookings(user.token)
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem', color: '#4b5563' }}>
        Please <Link to="/login">log in</Link> to see your bookings.
      </div>
    )
  }

  function updateOne(id: number, patch: Partial<Booking>) {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  async function onPay(b: Booking) {
    setBusyId(b.id)
    setError(null)
    try {
      const order = await createPaymentOrder(user!.token, b.id)

      // Dev / no keys: skip the gateway popup and confirm directly.
      if (!order.real) {
        await verifyPayment(user!.token, {
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: 'mock_pay',
          razorpaySignature: 'mock_sig',
        })
        updateOne(b.id, { status: 'CONFIRMED' })
        return
      }

      const ok = await loadRazorpay()
      if (!ok) {
        setError('Could not load the payment gateway.')
        return
      }

      const RazorpayCtor = (window as unknown as { Razorpay: new (o: object) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } }).Razorpay
      const rzp = new RazorpayCtor({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'GoJulley',
        description: b.listingTitle,
        prefill: { email: user!.email, name: user!.name },
        theme: { color: '#2563eb' },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment(user!.token, {
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            })
            updateOne(b.id, { status: 'CONFIRMED' })
          } catch (err) {
            setError((err as Error).message)
          }
        },
      } as object) as { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }

      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'))
      rzp.open()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  async function onCancel(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const updated = await cancelBooking(user!.token, id)
      updateOne(id, { status: updated.status })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <h2 className="section-title" style={{ margin: 0 }}>My bookings</h2>
        <Link to="/" className="btn btn-outline">← Browse listings</Link>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
      {!loading && bookings.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          No bookings yet. <Link to="/">Browse listings →</Link>
        </p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{
              padding: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong style={{ fontSize: 15 }}>{b.listingTitle}</strong>
                <span className={statusBadge[b.status]}>{b.status}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                {b.startDate} → {b.endDate} · {b.quantity} unit(s) · ₹{b.totalPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {b.status === 'PENDING' && (
                <button onClick={() => onPay(b)} disabled={busyId === b.id} className="btn btn-primary">
                  {busyId === b.id ? 'Processing…' : `Pay ₹${b.totalPrice.toLocaleString('en-IN')}`}
                </button>
              )}
              {b.status !== 'CANCELLED' && (
                <button onClick={() => onCancel(b.id)} disabled={busyId === b.id} className="btn btn-danger">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
