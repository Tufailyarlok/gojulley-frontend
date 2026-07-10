import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getListings, getReviewSummaries } from '../api'
import ListingCard from '../components/ListingCard'
import { addDays, todayISO } from '../dates'
import { placePhoto } from '../photos'
import type { Listing, ReviewSummary } from '../types'

// Build-your-own only. Ready-made tour packages live on /trips (the other path).
const CATEGORIES = [
  { key: 'stays', label: 'Stays' },
  { key: 'bikes', label: 'Bike rentals' },
  { key: 'cars', label: 'Car rentals' },
  { key: 'experiences', label: 'Experiences' },
] as const
type Cat = (typeof CATEGORIES)[number]['key']
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 } as const

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [summaries, setSummaries] = useState<Record<number, ReviewSummary>>({})

  const destination = params.get('destination') || ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const travellers = Number(params.get('travellers') || '2')
  const tab = (params.get('tab') as Cat) || 'stays'
  const today = todayISO()

  function setParam(patch: Record<string, string>) {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }

  useEffect(() => {
    getListings().then(setListings).catch(() => {})
    getReviewSummaries()
      .then((l) => setSummaries(Object.fromEntries(l.map((s) => [s.listingId, s]))))
      .catch(() => {})
  }, [])

  const locations = useMemo(() => [...new Set(listings.map((l) => l.location))].sort(), [listings])
  const stays = useMemo(() => listings.filter((l) => (l.type === 'HOTEL' || l.type === 'HOMESTAY') && (!destination || l.location === destination)), [listings, destination])
  const bikes = useMemo(() => listings.filter((l) => l.type === 'BIKE' && (!destination || l.location === destination)), [listings, destination])
  const cars = useMemo(() => listings.filter((l) => l.type === 'CAR' && (!destination || l.location === destination)), [listings, destination])
  const experiences = useMemo(() => listings.filter((l) => l.type === 'EXPERIENCE' && (!destination || l.location === destination)), [listings, destination])
  const counts: Record<Cat, number> = { stays: stays.length, bikes: bikes.length, cars: cars.length, experiences: experiences.length }

  const listingGrid = (items: Listing[], emptyMsg: string) =>
    items.length ? (
      <div style={gridStyle}>
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} summary={summaries[l.id]} />
        ))}
      </div>
    ) : (
      <p style={{ color: 'var(--faint)' }}>{emptyMsg}</p>
    )

  return (
    <>
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img src={placePhoto(destination)} alt={destination || 'Ladakh'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,7,18,0.15), rgba(3,7,18,0.72))' }} />
        <div className="page" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 20 }}>
          <Link to="/" style={{ color: '#dbe4ff', fontSize: 13, fontWeight: 700 }}>← Home</Link>
          <h1 style={{ color: '#fff', fontSize: 34, fontWeight: 900, margin: '6px 0 0' }}>{destination || 'All of Ladakh'}</h1>
          <p style={{ color: '#c7d0f0', margin: '2px 0 0', fontSize: 15 }}>
            {travellers} traveller{travellers > 1 ? 's' : ''}
            {from ? ` · ${from}${to ? ` → ${to}` : ''}` : ''}
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 20 }}>
        <div className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
          <label className="label" style={{ margin: 0, flex: '1 1 180px' }}>
            Destination
            <select className="field" value={destination} onChange={(e) => setParam({ destination: e.target.value })}>
              <option value="">Anywhere in Ladakh</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </label>
          <label className="label" style={{ margin: 0, flex: '1 1 140px' }}>
            Check-in
            <input
              className="field"
              type="date"
              min={today}
              max={to ? addDays(to, -1) : undefined}
              value={from}
              onChange={(e) => setParam({ from: e.target.value, ...(to && to <= e.target.value ? { to: '' } : {}) })}
            />
          </label>
          <label className="label" style={{ margin: 0, flex: '1 1 140px' }}>
            Check-out
            <input
              className="field"
              type="date"
              min={from ? addDays(from, 1) : addDays(today, 1)}
              value={to}
              onChange={(e) => setParam({ to: e.target.value })}
            />
          </label>
          <label className="label" style={{ margin: 0, flex: '0 1 120px' }}>
            Travellers
            <select className="field" value={travellers} onChange={(e) => setParam({ travellers: e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
          {CATEGORIES.map((c) => (
            <button key={c.key} className={`filter-pill${tab === c.key ? ' active' : ''}`} onClick={() => setParam({ tab: c.key })}>
              {c.label}
              {counts[c.key] ? ` (${counts[c.key]})` : ''}
            </button>
          ))}
        </div>

        <p className="section-sub" style={{ marginTop: -10, marginBottom: 22 }}>
          Prefer everything handled for you?{' '}
          <Link to="/trips" style={{ color: 'var(--navy)', fontWeight: 700 }}>Browse ready-made packages →</Link>
        </p>

        {tab === 'stays' && listingGrid(stays, `No stays${destination ? ` in ${destination}` : ''} yet.`)}
        {tab === 'bikes' && listingGrid(bikes, 'No bikes available here yet.')}
        {tab === 'cars' && listingGrid(cars, 'No cars available here yet.')}
        {tab === 'experiences' && listingGrid(experiences, `No experiences${destination ? ` in ${destination}` : ''} yet.`)}
      </div>
    </>
  )
}
