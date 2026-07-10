import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getListings } from '../api'
import { addDays, todayISO } from '../dates'
import type { Listing } from '../types'

export default function ListingsPage() {
  const navigate = useNavigate()

  // Listings are fetched only to populate the destination dropdown.
  const [listings, setListings] = useState<Listing[]>([])

  // Hero search draft → navigates to the /search results page.
  const [draftLocation, setDraftLocation] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [travellers, setTravellers] = useState(2)
  const today = todayISO()

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch(() => {})
  }, [])

  const locations = useMemo(() => [...new Set(listings.map((l) => l.location))].sort(), [listings])

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
          <p className="section-sub" style={{ marginBottom: 22 }}>
            Book a ready-made package, or build your own from the same stays, rides and experiences.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <button type="button" className="path-card" onClick={() => navigate('/trips')}>
              <span className="type-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>Fastest</span>
              <h3>Book a ready-made package</h3>
              <p>We handle it end to end — stays, rides, permits and on-call support, one price and one booking.</p>
              <span className="path-cta">Browse packages →</span>
            </button>

            <button type="button" className="path-card" onClick={() => navigate('/search?tab=stays')}>
              <span className="type-badge" style={{ background: '#f0fdfa', color: '#0f766e' }}>Your way</span>
              <h3>Build your own trip</h3>
              <p>Pick your own stays, rides and experiences across Leh, Nubra and Pangong — and book them together.</p>
              <span className="path-cta">Browse stays, rides &amp; experiences →</span>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
