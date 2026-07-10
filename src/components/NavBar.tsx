import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useCart } from '../cart'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { count } = useCart()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">G</span>
          GoJulley
        </Link>
        <span className="brand-sub">· Ladakh trips</span>

        <span className="nav-spacer" />
        <div className="nav-actions">
          <Link to="/trips" className="nav-link">
            Trips
          </Link>
          <Link to="/cart" className="nav-link">
            Cart{count > 0 ? ` (${count})` : ''}
          </Link>
          {user && (
            <Link to="/bookings" className="nav-link">
              My bookings
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="nav-user">
                {user.name} ({user.role.toLowerCase()})
              </span>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '6px 14px' }}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
