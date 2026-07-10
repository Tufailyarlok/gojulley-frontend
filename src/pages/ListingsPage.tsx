import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getListings, getReviewSummaries, getTrips } from '../api'
import ListingCard from '../components/ListingCard'
import TripCard from '../components/TripCard'
import { addDays, todayISO } from '../dates'
import type { Listing, ReviewSummary, TripPackage } from '../types'

export default function ListingsPage() {
  const navigate = useNavigate()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trips, setTrips] = useState<TripPackage[]>([])
  const [summaries, setSummaries] = useState<Record<number, ReviewSummary>>({})

  // Hero search draft → navigates to the /search results page.
  const [draftLocation, setDraftLocation] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [travellers, setTravellers] = useState(2)
  const today = todayISO()

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
    getReviewSummaries()
      .then((l) => setSummaries(Object.fromEntries(l.map((s) => [s.listingId, s]))))
      .catch(() => {})
  }, [])

  const locations = useMemo(() => [...new Set(listings.map((l) => l.location))].sort(), [listings])
  // Individual inventory grouped into category sections (not one mixed grid).
  const stays = useMemo(() => listings.filter((l) => l.type === 'HOTEL' || l.type === 'HOMESTAY'), [listings])
  const bikes = useMemo(() => listings.filter((l) => l.type === 'BIKE'), [listings])
  const cars = useMemo(() => listings.filter((l) => l.type === 'CAR'), [listings])
  const experiences = useMemo(() => listings.filter((l) => l.type === 'EXPERIENCE'), [listings])
  const sections = [
    { key: 'stays', eyebrow: 'Stays', title: 'Stays & homestays', sub: 'Hotels, lakeside camps and family homestays across the valleys.', items: stays },
    { key: 'bikes', eyebrow: 'Rentals', title: 'Bike rentals', sub: 'Self-drive Himalayans, Classics and more, ready for the high passes.', items: bikes },
    { key: 'cars', eyebrow: 'Rentals', title: 'Car rentals & taxis', sub: 'SUVs and tempo travellers with drivers who know the roads.', items: cars },
    { key: 'experiences', eyebrow: 'Things to do', title: 'Experiences', sub: 'Camel safaris, rafting, monastery tours, ATV rides and more — add them to any package or your own plan.', items: experiences },
  ] as const

  function onFrom(v: string) {
    setFrom(v)
    if (to && to <= v) setTo('')
  }
  function onTo(v: string) {
    setTo(v)
    if (from && v <= from) setFrom('')
  }

  function runSearch() {
    const p = new URLSearchParams()
    if (draftLocation) p.set('destination', draftLocation)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    p.set('travellers', String(travellers))
    navigate(`/search?${p.toString()}`)
  }

  function scrollToId(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            <select className="plan-input" value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)}>
              <option value="">Anywhere in Ladakh</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="field-cell">
            <label>Dates</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className="plan-input plan-date" type="date" min={today} max={to ? addDays(to, -1) : undefined} value={from} onChange={(e) => onFrom(e.target.value)} aria-label="Check-in" />
              <span style={{ color: 'var(--faint)' }}>→</span>
              <input className="plan-input plan-date" type="date" min={from ? addDays(from, 1) : addDays(today, 1)} value={to} onChange={(e) => onTo(e.target.value)} aria-label="Check-out" />
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
          <button className="plan-go" type="button" onClick={runSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            Search
          </button>
        </div>
      </div>

      <div className="page">
        <section style={{ paddingTop: 44 }}>
          <span className="eyebrow">One platform · everything in one place</span>
          <h2 className="section-title">Two ways to plan your Ladakh trip</h2>
          <p className="section-sub" style={{ marginBottom: 18 }}>
            Book a ready-made package, or build your own from the same stays, rides and experiences.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {trips.length > 0 && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="type-badge" style={{ alignSelf: 'flex-start', background: '#eff6ff', color: '#1d4ed8' }}>Fastest</span>
                <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>Book a ready-made package</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, flex: 1 }}>
                  We handle it end to end — stays, rides, permits and on-call support, one price and one booking.
                </p>
                <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => scrollToId('packages')}>
                  See packages ↓
                </button>
              </div>
            )}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="type-badge" style={{ alignSelf: 'flex-start', background: '#f0fdfa', color: '#0f766e' }}>Your way</span>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>Build your own trip</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, flex: 1 }}>
                Pick your own stays, rides and experiences across Leh, Nubra and Pangong — and book them together.
              </p>
              <button type="button" className="btn btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => scrollToId('build')}>
                Start building ↓
              </button>
            </div>
          </div>
        </section>

        {trips.length > 0 && (
          <section id="packages" style={{ paddingTop: 48, scrollMarginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
              <div>
                <span className="eyebrow">Ready-made packages</span>
                <h2 className="section-title">Whole trips, planned end to end</h2>
                <p className="section-sub">One price, one booking — stays, rides, permits and support, all sorted.</p>
              </div>
              <Link to="/trips" className="nav-link" style={{ color: 'var(--navy)', whiteSpace: 'nowrap' }}>See all trips →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {trips.slice(0, 3).map((t, i) => (
                <TripCard key={t.id} trip={t} index={i} />
              ))}
            </div>
          </section>
        )}

        <section id="build" style={{ paddingTop: 52, scrollMarginTop: 80 }}>
          <span className="eyebrow">Build your own trip</span>
          <h2 className="section-title">Book services individually</h2>
          <p className="section-sub">Browse by category across Leh, Nubra and Pangong, then book what you pick — together.</p>
        </section>

        {loading && <p style={{ color: 'var(--faint)', paddingTop: 20 }}>Loading listings…</p>}
        {error && <div className="alert alert-error" style={{ marginTop: 20 }}>Couldn’t load listings: {error}</div>}

        {!loading &&
          !error &&
          sections.map((s) =>
            s.items.length === 0 ? null : (
              <section key={s.key} style={{ paddingTop: 40 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                  <div>
                    <span className="eyebrow">{s.eyebrow}</span>
                    <h3 className="section-title" style={{ fontSize: 22 }}>{s.title}</h3>
                    <p className="section-sub">{s.sub}</p>
                  </div>
                  {s.items.length > 4 && (
                    <Link to={`/search?tab=${s.key}`} className="nav-link" style={{ color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                      See all {s.items.length} →
                    </Link>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 20 }}>
                  {s.items.slice(0, 4).map((l) => (
                    <ListingCard key={l.id} listing={l} summary={summaries[l.id]} />
                  ))}
                </div>
              </section>
            ),
          )}
      </div>

    </>
  )
}
