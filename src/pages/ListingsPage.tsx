import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getListings, getTrips } from '../api'
import { useAuth } from '../auth'
import BookingModal from '../components/BookingModal'
import PhotoTile from '../components/PhotoTile'
import { listingPhoto, tripPhoto } from '../photos'
import type { Listing, ListingType, TripPackage } from '../types'

// Local-timezone yyyy-mm-dd date helpers (no UTC off-by-one).
function localISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  return localISO(new Date(y, m - 1, d + n))
}

const TYPE_META = {
  HOTEL: { label: 'Hotels', badge: 'Hotel', tint: '#eff6ff', ink: '#1d4ed8', theme: 'blue' },
  HOMESTAY: { label: 'Homestays', badge: 'Homestay', tint: '#ecfdf5', ink: '#047857', theme: 'green' },
  CAR: { label: 'Cars / Taxi', badge: 'Car / Taxi', tint: '#fffbeb', ink: '#b45309', theme: 'amber' },
  BIKE: { label: 'Bikes', badge: 'Bike', tint: '#fdf4ff', ink: '#a21caf', theme: 'purple' },
} as const

const TRIP_THEMES = ['blue', 'amber', 'teal'] as const
type Filter = 'ALL' | ListingType
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function ListingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [booking, setBooking] = useState<Listing | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [trips, setTrips] = useState<TripPackage[]>([])
  const [searchLocation, setSearchLocation] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [travellers, setTravellers] = useState(2)
  const today = localISO(new Date())

  function load() {
    getListings()
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    getTrips()
      .then(setTrips)
      .catch(() => {})
  }, [])

  const locations = useMemo(() => [...new Set(listings.map((l) => l.location))].sort(), [listings])
  const visible = useMemo(
    () =>
      listings.filter(
        (l) => (filter === 'ALL' || l.type === filter) && (!searchLocation || l.location === searchLocation),
      ),
    [listings, filter, searchLocation],
  )
  const visibleTrips = useMemo(
    () => (searchLocation ? trips.filter((t) => t.route.toLowerCase().includes(searchLocation.toLowerCase())) : trips),
    [trips, searchLocation],
  )
  const filters: Filter[] = ['ALL', 'HOTEL', 'HOMESTAY', 'CAR', 'BIKE']

  function onFrom(v: string) {
    setFrom(v)
    if (to && to <= v) setTo('')
  }
  function onTo(v: string) {
    setTo(v)
    if (from && v <= from) setFrom('')
  }

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
    load()
  }

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Stays · Rides · Whole trips · 11,500 ft</span>
          <h1>Your whole Ladakh trip, handled.</h1>
          <p>
            Curated packages or individual stays and rides across Leh, Nubra and Pangong — permits, driver, oxygen and
            on-call support included, booked and paid in one place.
          </p>
          <div className="hero-trust">
            <span><i></i> Inner Line Permits sorted</span>
            <span><i></i> Driver, fuel &amp; oxygen included</span>
            <span><i></i> On-call mechanic support</span>
          </div>
        </div>
        <svg className="hero-ridge" viewBox="0 0 1440 180" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,180 0,115 210,55 430,115 640,45 860,115 1080,65 1290,125 1440,85 1440,180" fill="#28328c" opacity="0.55" />
          <polygon points="0,180 0,140 260,90 520,140 760,85 1010,140 1240,100 1440,140 1440,180" fill="#1b2a63" opacity="0.85" />
          <polygon points="0,180 0,165 300,132 600,165 900,128 1200,165 1440,138 1440,180" fill="#ffffff" />
        </svg>
      </header>

      <div className="planbar">
        <div className="planbar-card">
          <div className="field-cell">
            <label>Destination</label>
            <select className="plan-input" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}>
              <option value="">Anywhere in Ladakh</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="field-cell">
            <label>Dates</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                className="plan-input plan-date"
                type="date"
                min={today}
                max={to ? addDays(to, -1) : undefined}
                value={from}
                onChange={(e) => onFrom(e.target.value)}
                aria-label="Check-in"
              />
              <span style={{ color: 'var(--faint)' }}>→</span>
              <input
                className="plan-input plan-date"
                type="date"
                min={from ? addDays(from, 1) : addDays(today, 1)}
                value={to}
                onChange={(e) => onTo(e.target.value)}
                aria-label="Check-out"
              />
            </div>
          </div>
          <div className="field-cell">
            <label>Travellers</label>
            <select className="plan-input" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'traveller' : 'travellers'}</option>
              ))}
            </select>
          </div>
          <button
            className="plan-go"
            type="button"
            onClick={() => (document.getElementById('trips') || document.getElementById('results'))?.scrollIntoView({ behavior: 'smooth' })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            Search
          </button>
        </div>
      </div>

      <div className="page">
        {flash && <div className="alert alert-success" style={{ marginTop: 24 }}>{flash}</div>}

        {visibleTrips.length > 0 && (
          <section id="trips" style={{ paddingTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
              <div>
                <span className="eyebrow">Curated packages</span>
                <h2 className="section-title">Whole trips, planned end to end</h2>
                <p className="section-sub">One price, one booking — stays, rides, permits and support, all sorted.</p>
              </div>
              <Link to="/trips" className="nav-link" style={{ color: 'var(--navy)', whiteSpace: 'nowrap' }}>See all trips →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {visibleTrips.slice(0, 3).map((t, i) => (
                <article key={t.id} className="listing-card">
                  <PhotoTile theme={TRIP_THEMES[i % TRIP_THEMES.length]} sun src={tripPhoto(t, i)} alt={t.title}>
                    <span className="ph-route">{t.durationDays} days · {t.route}</span>
                  </PhotoTile>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800 }}>{t.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0, flex: 1 }}>{t.summary}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                        {inr(t.pricePerPerson)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--faint)' }}> /person</span>
                      </div>
                      <Link to={`/trips/${t.id}`} className="btn btn-primary">View trip</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="results" style={{ paddingTop: 52 }}>
          <span className="eyebrow">À la carte</span>
          <h2 className="section-title">Or book individual stays &amp; rides</h2>
          <p className="section-sub" style={{ marginBottom: 20 }}>Pick exactly what you need across Leh, Nubra and Pangong.</p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-pill${filter === f ? ' active' : ''}`}>
                {f === 'ALL' ? 'All' : TYPE_META[f].label}
              </button>
            ))}
          </div>

          {loading && <p style={{ color: 'var(--faint)' }}>Loading listings…</p>}
          {error && <div className="alert alert-error">Couldn’t load listings: {error}</div>}

          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 20 }}>
              {visible.map((l) => {
                const meta = TYPE_META[l.type]
                return (
                  <article key={l.id} className="listing-card">
                    <PhotoTile theme={meta.theme} src={listingPhoto(l)} alt={l.title}>
                      <span className="ph-badge" style={{ color: meta.ink }}>{meta.badge}</span>
                    </PhotoTile>
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      <span className="type-badge" style={{ background: meta.tint, color: meta.ink }}>{l.location}</span>
                      <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>{l.title}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0, flex: 1 }}>{l.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                            {inr(l.pricePerDay)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--faint)' }}>/day</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: l.quantity > 0 ? 'var(--ok)' : 'var(--danger)' }}>
                            {l.quantity > 0 ? `${l.quantity} available` : 'Sold out'}
                          </div>
                        </div>
                        <button onClick={() => onBook(l)} disabled={l.quantity === 0} className="btn btn-primary">
                          {l.quantity === 0 ? 'Sold out' : 'Book now'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
              {visible.length === 0 && <p style={{ color: 'var(--faint)' }}>No listings for this filter yet.</p>}
            </div>
          )}
        </section>
      </div>

      {booking && (
        <BookingModal
          listing={booking}
          onClose={() => setBooking(null)}
          onBooked={onBooked}
          initialStart={from}
          initialEnd={to}
          initialQuantity={travellers}
        />
      )}
    </>
  )
}
