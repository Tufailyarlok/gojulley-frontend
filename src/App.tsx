import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth'
import NavBar from './components/NavBar'
import ListingsPage from './pages/ListingsPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
