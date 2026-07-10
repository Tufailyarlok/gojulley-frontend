import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../cart'

// Floating bar that slides up whenever there's something in the cart, so the
// user can always jump to checkout. Hidden on the cart page itself.
export default function CartBar() {
  const { count } = useCart()
  const { pathname } = useLocation()
  if (count < 1 || pathname === '/cart') return null
  return (
    <div className="cart-bar" role="region" aria-label="Cart">
      <span className="cart-bar-count">🛒 {count} item{count > 1 ? 's' : ''} in your cart</span>
      <Link to="/cart" className="cart-bar-go">View cart →</Link>
    </div>
  )
}
