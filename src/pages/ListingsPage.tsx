import { Link, useNavigate } from 'react-router-dom'

import { useSeo } from '../useSeo'

export default function ListingsPage() {
  const navigate = useNavigate()
  useSeo({
    title: 'GoJulley — Ladakh Trip Booking: Packages, Stays, Bikes & Taxis',
    description:
      'Book your whole Ladakh trip in one place — curated packages or individual stays, taxis, bikes and services across Leh, Nubra and Pangong.',
    path: '/',
  })

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <img
            src="/logo.png"
            alt="GoJulley — Unforgettable Journeys"
            style={{ width: 220, maxWidth: '62%', borderRadius: 14, marginBottom: 22, display: 'block', boxShadow: '0 6px 20px rgba(0,0,0,0.18)' }}
          />
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

      <div className="page">
        <section style={{ paddingTop: 48 }}>
          <span className="eyebrow">One platform · everything in one place</span>
          <h2 className="section-title">Two ways to plan your Ladakh trip</h2>
          <p className="section-sub" style={{ marginBottom: 22 }}>
            Book a ready-made package, or build your own from the same stays, rides and services.{' '}
            <Link to="/guide" style={{ color: 'var(--navy)', fontWeight: 700 }}>Not sure where to go? Explore Ladakh →</Link>
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
              <p>Pick your own stays, rides and services across Leh, Nubra and Pangong — and book them together.</p>
              <span className="path-cta">Browse stays, rides &amp; services →</span>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
