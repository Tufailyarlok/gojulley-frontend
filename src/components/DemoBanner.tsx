import { DEMO_MODE } from '../config'

// Site-wide notice that this is a portfolio demo on sample data. Hidden
// automatically when VITE_DEMO_MODE=false (real launch).
export default function DemoBanner() {
  if (!DEMO_MODE) return null
  return (
    <div
      style={{
        background: '#28328c',
        color: '#fff',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 1.4,
        padding: '8px 14px',
      }}
    >
      <strong>Demo project</strong> — GoJulley is a portfolio showcase. Listings, prices &amp; availability are
      sample data, and bookings &amp; payments are disabled.
    </div>
  )
}
