import ListingCard from './ListingCard'
import type { Listing } from '../types'

// Weaves add-on services (guide, photographer, mechanic, coordinator) into trip
// & listing detail pages so they feel part of ONE trip. Renders nothing when empty.
export default function ServiceStrip({
  title,
  subtitle,
  services,
}: {
  title: string
  subtitle?: string
  services: Listing[]
}) {
  if (!services.length) return null
  return (
    <section>
      <span className="eyebrow">Add-on services</span>
      <h3 className="section-title" style={{ fontSize: 22, margin: '2px 0 0' }}>{title}</h3>
      {subtitle && <p className="section-sub" style={{ marginTop: 4, marginBottom: 16 }}>{subtitle}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: subtitle ? 0 : 16 }}>
        {services.map((x) => (
          <ListingCard key={x.id} listing={x} />
        ))}
      </div>
    </section>
  )
}
