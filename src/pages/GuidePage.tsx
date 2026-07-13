import { Link } from 'react-router-dom'

// Stylised (not-to-scale) Ladakh map — pure SVG, no external tiles/deps so it
// always renders. Pins are clickable and scroll to the matching place card.

type PlaceKey = 'leh' | 'nubra' | 'turtuk' | 'pangong' | 'zanskar'

const POS: Record<PlaceKey, { x: number; y: number }> = {
  leh: { x: 400, y: 312 },
  nubra: { x: 338, y: 150 },
  turtuk: { x: 168, y: 92 },
  pangong: { x: 662, y: 360 },
  zanskar: { x: 214, y: 432 },
}

const ROUTES: { from: PlaceKey; to: PlaceKey; label?: string; dashed?: boolean }[] = [
  { from: 'leh', to: 'nubra', label: 'Khardung La' },
  { from: 'nubra', to: 'turtuk' },
  { from: 'leh', to: 'pangong', label: 'Chang La' },
  { from: 'leh', to: 'zanskar', label: 'via Kargil' },
  { from: 'nubra', to: 'pangong', label: 'Shyok', dashed: true },
]

const PLACES: {
  key: PlaceKey
  name: string
  meta: string
  access: string
  permit?: boolean
  doList: string[]
}[] = [
  {
    key: 'leh',
    name: 'Leh',
    meta: 'Your base · 3,500 m',
    access: 'Where every trip starts — fly in and rest a day to acclimatise before the high passes.',
    doList: [
      'Shanti Stupa & Leh Palace at sunset',
      'Wander the old-town bazaar',
      'Day trip to Thiksey, Hemis & Shey monasteries',
      'Magnetic Hill & Sangam (Indus–Zanskar confluence)',
    ],
  },
  {
    key: 'nubra',
    name: 'Nubra Valley',
    meta: 'Over Khardung La · ~150 km',
    access: '5–6 hrs from Leh across Khardung La (5,359 m).',
    permit: true,
    doList: [
      'Bactrian (two-hump) camel ride on the Hunder sand dunes',
      'Diskit Monastery & the giant Maitreya Buddha',
      'ATV / quad biking across the cold-desert dunes',
      'Hot springs at Panamik',
    ],
  },
  {
    key: 'turtuk',
    name: 'Turtuk',
    meta: 'Balti border village',
    access: 'A day trip beyond Nubra — one of India’s last villages before the border.',
    permit: true,
    doList: [
      'Walk the apricot orchards & centuries-old Balti houses',
      'Turtuk waterfall & viewpoints',
      'Meet the Balti community and taste local apricot dishes',
    ],
  },
  {
    key: 'pangong',
    name: 'Pangong Tso',
    meta: 'Over Chang La · ~220 km',
    access: '5–6 hrs from Leh across Chang La (5,360 m).',
    permit: true,
    doList: [
      'Watch the lake shift blue-to-turquoise through the day',
      'Camp lakeside under the stars',
      'Sunrise over the water & astro-photography',
    ],
  },
  {
    key: 'zanskar',
    name: 'Zanskar',
    meta: 'Via Kargil · for the adventurous',
    access: 'A longer loop via Kargil — best on an 8-day-plus trip.',
    doList: [
      'White-water rafting through the Zanskar gorge',
      'Remote monasteries — Phugtal, Karsha',
      'Padum and the high valley villages',
    ],
  },
]

const ITINERARIES: { days: string; title: string; stops: string; blurb: string }[] = [
  { days: '3 days', title: 'Leh & monasteries', stops: 'Leh', blurb: 'Old town, Shanti Stupa and the great monasteries — no high passes, gentle on altitude.' },
  { days: '5 days', title: 'Leh + Nubra', stops: 'Leh · Nubra', blurb: 'Add the camel dunes and Diskit, over Khardung La.' },
  { days: '7 days', title: 'The classic circuit', stops: 'Leh · Nubra · Pangong', blurb: 'The full loop — dunes, the blue lake and two of the world’s highest passes.' },
  { days: '9 days', title: 'Complete Ladakh', stops: 'Leh · Nubra · Turtuk · Pangong', blurb: 'Everything, unhurried — plus the border village of Turtuk.' },
]

function scrollToPlace(key: PlaceKey) {
  document.getElementById(`place-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

import { useSeo } from '../useSeo'

export default function GuidePage() {
  useSeo({
    title: 'Explore Ladakh — Places, Routes & Things to Do | GoJulley',
    description:
      'A guide to Ladakh — Leh, Nubra, Pangong and beyond: where to go, how to get around, and what you can do.',
    path: '/guide',
  })
  return (
    <div className="page" style={{ maxWidth: 1000, paddingTop: '2rem' }}>
      <span className="eyebrow">Explore Ladakh</span>
      <h1 className="section-title" style={{ fontSize: 30 }}>Where to go &amp; what you can do</h1>
      <p className="section-sub" style={{ marginBottom: 22, maxWidth: 640 }}>
        Rent a taxi or a self-drive bike for a few days and this is your playground. Tap a spot on the map to see what’s
        there — then build your own trip or grab a ready-made package.
      </p>

      {/* Map */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox="0 0 820 500" role="img" aria-label="Stylised map of Ladakh" style={{ width: '100%', minWidth: 560, display: 'block' }}>
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#eaf1ff" />
                <stop offset="1" stopColor="#f6f1e7" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="820" height="500" fill="url(#sky)" />
            {/* soft mountain ridges */}
            <polygon points="0,500 0,330 150,250 320,330 480,240 640,320 820,250 820,500" fill="#dfe6f5" opacity="0.7" />
            <polygon points="0,500 0,400 180,330 380,400 560,330 760,400 820,370 820,500" fill="#e7e0d0" opacity="0.6" />

            {/* routes */}
            {ROUTES.map((r, i) => {
              const a = POS[r.from]
              const b = POS[r.to]
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2
              return (
                <g key={i}>
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="#28328c" strokeWidth={r.dashed ? 1.5 : 2.5}
                    strokeDasharray={r.dashed ? '5 6' : undefined} opacity={r.dashed ? 0.4 : 0.65}
                    strokeLinecap="round"
                  />
                  {r.label && (
                    <>
                      <rect x={mx - r.label.length * 3.6 - 6} y={my - 20} width={r.label.length * 7.2 + 12} height={16} rx={8} fill="#ffffff" opacity="0.85" />
                      <text x={mx} y={my - 8} textAnchor="middle" fontSize="11" fill="#4b5563" letterSpacing="0.3">{r.label}</text>
                    </>
                  )}
                </g>
              )
            })}

            {/* pins */}
            {PLACES.map((p) => {
              const { x, y } = POS[p.key]
              const hub = p.key === 'leh'
              return (
                <g key={p.key} className="map-pin" onClick={() => scrollToPlace(p.key)} role="button" aria-label={p.name}>
                  <circle cx={x} cy={y} r={hub ? 11 : 8} fill={hub ? '#199fd9' : '#28328c'} stroke="#fff" strokeWidth="3" />
                  <rect x={x + 14} y={y - 12} width={p.name.length * 8 + 16} height={24} rx={12} fill="#fff" stroke="var(--line)" />
                  <text x={x + 22} y={y + 4} fontSize="13" fontWeight="800" fill="#111827">{p.name}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Place details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {PLACES.map((p) => (
          <div key={p.key} id={`place-${p.key}`} className="card" style={{ scrollMarginTop: 80, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{p.name}</h3>
              {p.permit && <span className="type-badge" style={{ background: '#fffbeb', color: '#b45309' }}>Permit sorted</span>}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cyan)' }}>{p.meta}</div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{p.access}</p>
            <ul style={{ margin: '4px 0 0', paddingLeft: 18, display: 'grid', gap: 5, fontSize: 13.5, color: 'var(--ink)' }}>
              {p.doList.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Suggested routes */}
      <section style={{ paddingTop: 44 }}>
        <span className="eyebrow">Suggested routes</span>
        <h2 className="section-title">How many days do you have?</h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>Rough guides by trip length — pace it slower at altitude.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {ITINERARIES.map((it) => (
            <div key={it.days} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="type-badge" style={{ alignSelf: 'flex-start', background: '#eff6ff', color: '#1d4ed8' }}>{it.days}</span>
              <h3 style={{ fontSize: 16.5, fontWeight: 800, margin: 0 }}>{it.title}</h3>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--faint)' }}>{it.stops}</div>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0, flex: 1 }}>{it.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="card" style={{ marginTop: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Ready to plan?</h3>
        <p className="section-sub" style={{ margin: 0 }}>Book a ready-made package, or build your own from stays, taxis, bikes and services.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/trips" className="btn btn-primary">Browse packages</Link>
          <Link to="/search?tab=stays" className="btn btn-outline">Build your own trip</Link>
        </div>
      </div>
    </div>
  )
}
