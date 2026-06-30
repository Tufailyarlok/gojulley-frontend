import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, getMyBookings, payForBooking } from '../api'
import { useAuth } from '../auth'
import type { Booking } from '../types'

const statusColor: Record<Booking['status'], string> = {
  PENDING: '#b45309',
  CONFIRMED: '#059669',
  CANCELLED: '#9ca3af',
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
      // A fresh key per payment attempt; the backend uses it to stay idempotent.
      const key = crypto.randomUUID()
      const payment = await payForBooking(user!.token, b.id, key)
      if (payment.status === 'PAID') updateOne(b.id, { status: 'CONFIRMED' })
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
      <h2 style={{ marginTop: 0 }}>My bookings</h2>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && bookings.length === 0 && (
        <p style={{ color: '#6b7280' }}>
          No bookings yet. <Link to="/">Browse listings →</Link>
        </p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              background: '#fff',
            }}
          >
            <div>
              <strong>{b.listingTitle}</strong>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                {b.startDate} → {b.endDate} · {b.quantity} unit(s) · ₹{b.totalPrice.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[b.status] }}>{b.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {b.status === 'PENDING' && (
                <button
                  onClick={() => onPay(b)}
                  disabled={busyId === b.id}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14 }}
                >
                  {busyId === b.id ? 'Paying…' : `Pay ₹${b.totalPrice.toLocaleString('en-IN')}`}
                </button>
              )}
              {b.status !== 'CANCELLED' && (
                <button
                  onClick={() => onCancel(b.id)}
                  disabled={busyId === b.id}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #dc2626', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
                >
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
