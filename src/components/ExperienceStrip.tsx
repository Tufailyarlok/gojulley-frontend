import ListingCard from './ListingCard'
import type { Listing } from '../types'

// Weaves experiences into trip & listing detail pages so they feel part of ONE
// trip, not a separate catalog. Renders nothing when there's nothing to show.
export default function ExperienceStrip({
  title,
  subtitle,
  experiences,
}: {
  title: string
  subtitle?: string
  experiences: Listing[]
}) {
  if (!experiences.length) return null
  return (
    <section>
      <span className="eyebrow">Things to do</span>
      <h3 className="section-title" style={{ fontSize: 22, margin: '2px 0 0' }}>{title}</h3>
      {subtitle && <p className="section-sub" style={{ marginTop: 4, marginBottom: 16 }}>{subtitle}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: subtitle ? 0 : 16 }}>
        {experiences.map((x) => (
          <ListingCard key={x.id} listing={x} />
        ))}
      </div>
    </section>
  )
}
