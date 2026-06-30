import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, login as apiLogin, signup as apiSignup } from '../api'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await apiSignup(email, password, name)
        navigate('/verify', { state: { email } }) // go enter the emailed code
      } else {
        const user = await apiLogin(email, password)
        setUser(user)
        navigate(user.role === 'ADMIN' ? '/admin' : '/')
      }
    } catch (err) {
      // Logging into an unverified account returns 403 -> send them to verify.
      if (mode === 'login' && err instanceof ApiError && err.status === 403) {
        navigate('/verify', { state: { email } })
      } else {
        setError((err as Error).message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3.5rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>
          {mode === 'login' ? 'Log in to manage your Ladakh bookings.' : 'Sign up to start booking stays and rides.'}
        </p>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label className="label">
              Name
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          )}
          <label className="label">
            Email
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="label" style={{ marginBottom: 18 }}>
            Password
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="alert alert-error" style={{ marginBottom: 14 }}>{error}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary btn-block">
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 18, color: 'var(--muted)' }}>
          {mode === 'login' ? "No account? " : 'Have an account? '}
          <button
            className="btn-link"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 16, textAlign: 'center' }}>
        Demo admin · admin@tripstack.local / admin123
      </p>
    </div>
  )
}
