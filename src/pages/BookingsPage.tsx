import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, getMyBookings } from '../api'
import { useAuth } from '../auth'
import type { Booking } from '../types'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  async function onCancel(id: number) {
    try {
      const updated = await cancelBooking(user!.token, id)
      setBookings((bs) => bs.map((b) => (b.id === id ? updated : b)))
    } catch (err) {
      setError((err as Error).message)
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
              <span style={{ fontSize: 12, color: b.status === 'CONFIRMED' ? '#059669' : '#9ca3af' }}>{b.status}</span>
            </div>
            {b.status === 'CONFIRMED' && (
              <button
                onClick={() => onCancel(b.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #dc2626',
                  background: '#fff',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
