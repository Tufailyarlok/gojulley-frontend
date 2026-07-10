import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the previous scroll position on navigation, so opening a
// detail page from a link near the bottom would land you already scrolled down.
// Reset to the top on every path change. Renders nothing.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
