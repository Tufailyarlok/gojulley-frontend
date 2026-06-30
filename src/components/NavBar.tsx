import { Link } from 'react-router-dom'
import { useAuth } from '../auth'

const btn = {
  padding: '4px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
} as const

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none', color: '#111827', fontSize: 18 }}>
          TripStack
        </Link>
        <span style={{ color: '#9ca3af', fontSize: 13 }}>· Ladakh trips</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span style={{ color: '#6b7280' }}>
                {user.name} ({user.role.toLowerCase()})
              </span>
              <button onClick={logout} style={btn}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
