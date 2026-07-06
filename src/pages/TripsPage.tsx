import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrips } from '../api'
import type { TripPackage } from '../types'

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
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Curated Ladakh trips</h2>
      <p className="section-sub" style={{ marginBottom: 20 }}>
        Whole trips, handled end to end — stays, rides, permits and support in one booking. Just show up in Leh.
      </p>

      {error && <p className="alert alert-error">{error}</p>}
      {!trips && !error && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {trips && trips.length === 0 && <p style={{ color: 'var(--muted)' }}>No trips available yet.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {trips?.map((t) => (
          <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="type-badge">
              {t.durationDays} days · {t.route}
            </span>
            <h3 style={{ margin: '4px 0 0' }}>{t.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, flex: 1 }}>{t.summary}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 }}>
              <div>
                <strong style={{ fontSize: 20 }}>{inr(t.pricePerPerson)}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}> / person</span>
              </div>
              <Link to={`/trips/${t.id}`} className="btn btn-primary">
                View trip
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
