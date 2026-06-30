import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListings } from '../api'
import { useAuth } from '../auth'
import BookingModal from '../components/BookingModal'
import type { Listing, ListingType } from '../types'

const TYPE_META: Record<ListingType, { label: string; emoji: string }> = {
  HOTEL: { label: 'Hotels', emoji: '🏨' },
  HOMESTAY: { label: 'Homestays', emoji: '🏡' },
  CAR: { label: 'Cars / Taxi', emoji: '🚕' },
  BIKE: { label: 'Bikes', emoji: '🏍️' },
}

type Filter = 'ALL' | ListingType

export default function ListingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [booking, setBooking] = useState<Listing | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  function load() {
    getListings()
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const visible = useMemo(
    () => (filter === 'ALL' ? listings : listings.filter((l) => l.type === filter)),
    [listings, filter],
  )

  const filters: Filter[] = ['ALL', 'HOTEL', 'HOMESTAY', 'CAR', 'BIKE']

  function onBook(l: Listing) {
    if (!user) {
      navigate('/login')
      return
    }
    setFlash(null)
    setBooking(l)
  }

  function onBooked() {
    setBooking(null)
    setFlash('Booked! See it under “My bookings”.')
    load() // refresh availability counts
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ marginTop: 0 }}>Book your Ladakh trip</h2>
      <p style={{ color: '#6b7280', marginTop: 4 }}>Stays and rides across Leh, Nubra, Pangong and more.</p>

      {flash && (
        <div style={{ margin: '1rem 0', padding: '10px 14px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 14 }}>
          {flash}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '1.25rem 0' }}>
        {filters.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? '#2563eb' : '#d1d5db'}`,
                background: active ? '#2563eb' : '#fff',
                color: active ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {f === 'ALL' ? 'All' : `${TYPE_META[f].emoji} ${TYPE_META[f].label}`}
            </button>
          )
        })}
      </div>

      {loading && <p>Loading listings…</p>}
      {error && <p style={{ color: 'crimson' }}>Couldn’t load listings: {error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {visible.map((l) => (
            <article
              key={l.id}
              style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {TYPE_META[l.type].emoji} {l.location}
              </div>
              <h3 style={{ margin: '6px 0' }}>{l.title}</h3>
              <p style={{ fontSize: 14, color: '#4b5563', minHeight: 40, margin: '0 0 12px' }}>{l.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto' }}>
                <strong>
                  ₹{l.pricePerDay.toLocaleString('en-IN')}
                  <span style={{ fontWeight: 400, color: '#6b7280' }}>/day</span>
                </strong>
                <span style={{ fontSize: 12, color: l.quantity > 0 ? '#059669' : '#dc2626' }}>
                  {l.quantity > 0 ? `${l.quantity} available` : 'sold out'}
                </span>
              </div>
              <button
                onClick={() => onBook(l)}
                disabled={l.quantity === 0}
                style={{
                  marginTop: 12,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: l.quantity === 0 ? '#e5e7eb' : '#2563eb',
                  color: l.quantity === 0 ? '#9ca3af' : '#fff',
                  cursor: l.quantity === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                }}
              >
                {l.quantity === 0 ? 'Sold out' : 'Book'}
              </button>
            </article>
          ))}
          {visible.length === 0 && <p style={{ color: '#6b7280' }}>No listings for this filter yet.</p>}
        </div>
      )}

      {booking && <BookingModal listing={booking} onClose={() => setBooking(null)} onBooked={onBooked} />}
    </div>
  )
}
