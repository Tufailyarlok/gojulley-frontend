import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, login as apiLogin, requestLoginOtp, signup as apiSignup } from '../api'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const expired = searchParams.get('expired') === '1'

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
        const res = await apiLogin(email, password)
        // 2FA on: password was right, but a login code was emailed — go enter it.
        if (res.twoFactorRequired) {
          navigate('/login-otp', { state: { email, reason: '2fa' } })
          return
        }
        setUser({ token: res.token!, email: res.email, name: res.name!, role: res.role! })
        navigate(res.role === 'ADMIN' ? '/admin' : '/')
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

  // Passwordless: email a one-time login code instead of using a password.
  async function loginWithCode() {
    setError(null)
    if (!email) {
      setError('Enter your email first, then choose "Email me a login code".')
      return
    }
    setBusy(true)
    try {
      await requestLoginOtp(email)
      navigate('/login-otp', { state: { email, reason: 'passwordless' } })
    } catch (err) {
      setError((err as Error).message)
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

        {expired && (
          <p className="alert alert-error" style={{ marginBottom: 16 }}>
            Your session expired. Please log in again.
          </p>
        )}

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

        {mode === 'login' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 14 }}>
            <button type="button" className="btn-link" disabled={busy} onClick={loginWithCode}>
              Email me a login code
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => navigate('/forgot-password', { state: { email } })}
            >
              Forgot password?
            </button>
          </div>
        )}

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
        Demo login · customer@tripstack.local / customer123
      </p>
    </div>
  )
}
