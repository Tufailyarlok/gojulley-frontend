import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getListing, getListings } from '../api'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import BookingModal from '../components/BookingModal'
import ServiceStrip from '../components/ServiceStrip'
import Reviews from '../components/Reviews'
import { TYPE_DETAILS, TYPE_META, inr } from '../listingMeta'
import { listingPhoto } from '../photos'
import type { Listing } from '../types'

import { useSeo } from '../useSeo'

export default function ListingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { add, has } = useCart()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showBook, setShowBook] = useState(false)
  const [flash, setFlash] = useState<{ text: string; to: string; label: string } | null>(null)
  const [allListings, setAllListings] = useState<Listing[]>([])

  useSeo({
    title: listing ? `${listing.title} in ${listing.location} | GoJulley` : 'Listing | GoJulley',
    description: listing?.description,
  })

  useEffect(() => {
    if (!id) return
    getListing(Number(id))
      .then(setListing)
      .catch((e) => setError((e as Error).message))
  }, [id])

  useEffect(() => {
    getListings().then(setAllListings).catch(() => {})
  }, [])

  // Add-on services (trip-wide helpers) a traveler can book alongside this item.
  const services = useMemo(
    () => (listing ? allListings.filter((l) => l.type === 'SERVICE' && l.id !== listing.id) : []),
    [listing, allListings],
  )

  if (error && !listing) {
    return (
      <div className="page" style={{ paddingTop: '2rem' }}>
        <p className="alert alert-error">{error}</p>
        <Link to="/">← Home</Link>
      </div>
    )
  }
  if (!listing) {
    return <div className="page" style={{ paddingTop: '2rem', color: 'var(--faint)' }}>Loading…</div>
  }

  const meta = TYPE_META[listing.type]
  const soldOut = listing.quantity === 0

  function onBook() {
    if (!user) {
      navigate('/login')
      return
    }
    setShowBook(true)
  }
  function onBooked() {
    setShowBook(false)
    setFlash({ text: 'Reserved! Complete payment to confirm.', to: '/bookings', label: 'My bookings →' })
  }
  function addToCart() {
    if (!listing) return
    add(listing)
    setFlash({ text: 'Added to your cart.', to: '/cart', label: 'View cart →' })
  }

  return (
    <div className="page" style={{ maxWidth: 900, paddingTop: '1.5rem' }}>
      <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 14 }}>← Back</button>

      <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '21 / 9', background: 'var(--surface)' }}>
        <img src={listingPhoto(listing)} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <span className="type-badge" style={{ background: meta.tint, color: meta.ink }}>{meta.badge}</span>
        <span style={{ color: 'var(--faint)', fontSize: 14 }}>{listing.location}</span>
      </div>
      <h1 className="section-title" style={{ fontSize: 30, marginTop: 6 }}>{listing.title}</h1>
      <p className="section-sub" style={{ marginTop: 6 }}>{listing.description}</p>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
            {inr(listing.pricePerDay)}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--faint)' }}> /day</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: soldOut ? 'var(--danger)' : 'var(--ok)' }}>
            {soldOut ? 'Sold out' : `${listing.quantity} available`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className={`btn ${has(listing.id) ? 'btn-ok' : 'btn-primary'}`} disabled={soldOut} onClick={addToCart} style={{ padding: '11px 22px', fontSize: 15 }}>
            {soldOut ? 'Sold out' : has(listing.id) ? 'Added ✓ · add another' : 'Add to cart'}
          </button>
          <button className="btn btn-outline" disabled={soldOut} onClick={onBook} style={{ padding: '11px 22px', fontSize: 15 }}>
            Book now
          </button>
        </div>
      </div>
      {flash && (
        <div className="alert alert-success" style={{ marginTop: 14 }}>
          {flash.text} <Link to={flash.to}>{flash.label}</Link>
        </div>
      )}

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 17 }}>Good to know</h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, color: 'var(--muted)', fontSize: 14 }}>
          {TYPE_DETAILS[listing.type].map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 28 }}>
        <ServiceStrip
          title="Add services to your trip"
          subtitle="Trip-wide helpers you can book the same way — a local guide, photographer, on-call mechanic or coordinator."
          services={services}
        />
      </div>

      <div style={{ marginTop: 28 }}>
        <Reviews listingId={listing.id} />
      </div>

      {showBook && <BookingModal listing={listing} onClose={() => setShowBook(false)} onBooked={onBooked} />}
    </div>
  )
}
