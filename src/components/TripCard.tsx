import { Link } from 'react-router-dom'
import PhotoTile from './PhotoTile'
import { tripPhoto } from '../photos'
import { inr } from '../listingMeta'
import type { TripPackage } from '../types'

const TRIP_THEMES = ['blue', 'amber', 'teal', 'green', 'purple'] as const

export default function TripCard({ trip: t, index = 0 }: { trip: TripPackage; index?: number }) {
  return (
    <article className="listing-card">
      <PhotoTile theme={TRIP_THEMES[index % TRIP_THEMES.length]} sun src={tripPhoto(t, index)} alt={t.title}>
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
  )
}
