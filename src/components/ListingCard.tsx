import { Link } from 'react-router-dom'
import PhotoTile from './PhotoTile'
import Stars from './Stars'
import { useCart } from '../cart'
import { listingPhoto } from '../photos'
import { TYPE_META, inr } from '../listingMeta'
import type { Listing, ReviewSummary } from '../types'

export default function ListingCard({ listing: l, summary }: { listing: Listing; summary?: ReviewSummary }) {
  const meta = TYPE_META[l.type]
  const inCart = useCart().has(l.id)
  return (
    <Link
      to={`/listings/${l.id}`}
      className="listing-card"
      style={{ textDecoration: 'none', color: 'inherit', ...(inCart ? { borderColor: '#16a34a', boxShadow: '0 0 0 1.5px #16a34a' } : {}) }}
    >
      <PhotoTile theme={meta.theme} src={listingPhoto(l)} alt={l.title}>
        <span className="ph-badge" style={{ color: meta.ink }}>{meta.badge}</span>
        {inCart && <span className="ph-incart">✓ In cart</span>}
      </PhotoTile>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <span className="type-badge" style={{ background: meta.tint, color: meta.ink }}>{l.location}</span>
        <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>{l.title}</h3>
        {summary ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Stars value={summary.average} size={14} />
            <strong style={{ color: 'var(--ink)' }}>{summary.average.toFixed(1)}</strong>
            <span style={{ color: 'var(--faint)' }}>({summary.count})</span>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: 'var(--faint)' }}>No reviews yet</div>
        )}
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
          <span className="btn btn-primary">View details</span>
        </div>
      </div>
    </Link>
  )
}
