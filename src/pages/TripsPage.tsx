import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrips } from '../api'
import PhotoTile from '../components/PhotoTile'
import { tripPhoto } from '../photos'
import type { TripPackage } from '../types'

const THEMES = ['blue', 'amber', 'teal', 'green', 'purple'] as const
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function TripsPage() {
  const [trips, setTrips] = useState<TripPackage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((e) => setError((e as Error).message))
  }, [])

  return (
    <div className="page" style={{ paddingTop: '2.5rem' }}>
      <span className="eyebrow">Curated packages</span>
      <h2 className="section-title">Curated Ladakh trips</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        Whole trips, handled end to end — stays, rides, permits and support in one booking. Just show up in Leh.
      </p>

      {error && <p className="alert alert-error">{error}</p>}
      {!trips && !error && <p style={{ color: 'var(--faint)' }}>Loading…</p>}
      {trips && trips.length === 0 && <p style={{ color: 'var(--faint)' }}>No trips available yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {trips?.map((t, i) => (
          <article key={t.id} className="listing-card">
            <PhotoTile theme={THEMES[i % THEMES.length]} sun src={tripPhoto(t, i)} alt={t.title}>
              <span className="ph-route">{t.durationDays} days · {t.route}</span>
            </PhotoTile>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>{t.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: 0, flex: 1 }}>{t.summary}</p>
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
    </div>
  )
}
