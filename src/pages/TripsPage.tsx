import { useEffect, useState } from 'react'
import { getTrips } from '../api'
import TripCard from '../components/TripCard'
import type { TripPackage } from '../types'

import { useSeo } from '../useSeo'

export default function TripsPage() {
  useSeo({
    title: 'Ladakh Trip Packages — Curated Leh, Nubra & Pangong Tours | GoJulley',
    description:
      'Ready-made Ladakh trip packages with stays, rides, permits and support — book the whole trip in one place.',
    path: '/trips',
  })
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
          <TripCard key={t.id} trip={t} index={i} />
        ))}
      </div>
    </div>
  )
}
