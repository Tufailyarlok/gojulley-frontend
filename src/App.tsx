import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth'
import { CartProvider } from './cart'
import NavBar from './components/NavBar'
import ScrollToTop from './components/ScrollToTop'
import CartBar from './components/CartBar'
import Footer from './components/Footer'
import CartPage from './pages/CartPage'
import GuidePage from './pages/GuidePage'
import ListingsPage from './pages/ListingsPage'
import LoginPage from './pages/LoginPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import AdminPage from './pages/AdminPage'
import BookingsPage from './pages/BookingsPage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import SearchPage from './pages/SearchPage'
import ListingDetailPage from './pages/ListingDetailPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SupportPage from './pages/SupportPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        <ScrollToTop />
        <NavBar />
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<VerifyOtpPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
        <Footer />
        <CartBar />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
