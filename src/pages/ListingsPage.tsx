import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListings } from '../api'
import { useAuth } from '../auth'
import BookingModal from '../components/BookingModal'
import type { Listing, ListingType } from '../types'

const TYPE_META: Record<ListingType, { label: string; tint: string; ink: string }> = {
  HOTEL: { label: 'Hotels', tint: '#eff6ff', ink: '#1d4ed8' },
  HOMESTAY: { label: 'Homestays', tint: '#ecfdf5', ink: '#047857' },
  CAR: { label: 'Cars / Taxi', tint: '#fffbeb', ink: '#b45309' },
  BIKE: { label: 'Bikes', tint: '#fdf4ff', ink: '#a21caf' },
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
    setFlash('Reserved! Complete payment under “My bookings” to confirm.')
    load() // refresh availability counts
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="hero-eyebrow">Stays &amp; rides · 11,500 ft</span>
        <h1>Book your Ladakh trip, end to end</h1>
        <p>Hotels, homestays, taxis and bikes across Leh, Nubra, Pangong and beyond — reserved and paid for in one place.</p>
      </header>

      {flash && (
        <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
          {flash}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '1.75rem 0 1.5rem' }}>
        {filters.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-pill${active ? ' active' : ''}`}
            >
              {f === 'ALL' ? 'All' : TYPE_META[f].label}
            </button>
          )
        })}
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading listings…</p>}
      {error && <div className="alert alert-error">Couldn’t load listings: {error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {visible.map((l) => (
            <article key={l.id} className="listing-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span
                  className="type-badge"
                  style={{ background: TYPE_META[l.type].tint, color: TYPE_META[l.type].ink }}
                >
                  {TYPE_META[l.type].label}
                </span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{l.location}</span>
              </div>
              <h3 style={{ margin: '10px 0 4px', fontSize: 17 }}>{l.title}</h3>
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
              <button onClick={() => onBook(l)} disabled={l.quantity === 0} className="book-btn">
                {l.quantity === 0 ? 'Sold out' : 'Book now →'}
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
