import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        marginTop: '3rem',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        color: 'var(--faint)',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/support">Support</Link>
      </div>
      <div>© {new Date().getFullYear()} GoJulley · Ladakh trip bookings</div>
    </footer>
  )
}
