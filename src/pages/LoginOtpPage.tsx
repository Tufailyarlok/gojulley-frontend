import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { requestLoginOtp, verifyLoginOtp } from '../api'
import { useAuth } from '../auth'

// Completes a passwordless login OR a 2FA challenge — both use the emailed
// LOGIN code and the same verify endpoint. `reason` only changes the wording.
export default function LoginOtpPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { email?: string; reason?: '2fa' | 'passwordless' } | null
  const email = state?.email ?? ''
  const reason = state?.reason ?? 'passwordless'

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!email) {
    return (
      <div style={{ maxWidth: 420, margin: '3rem auto', padding: '0 1rem', color: 'var(--muted)' }}>
        Please <Link to="/login">log in</Link> first.
      </div>
    )
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user = await verifyLoginOtp(email, code.trim())
      setUser(user)
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onResend() {
    setError(null)
    setInfo(null)
    try {
      await requestLoginOtp(email)
      setInfo('A new code has been sent.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3.5rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 4 }}>
          {reason === '2fa' ? 'Two-factor verification' : 'Log in with a code'}
        </h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>
          {reason === '2fa'
            ? 'For extra security, enter the login code we just emailed to '
            : 'We emailed a one-time login code to '}
          <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
        </p>

        <form onSubmit={submit}>
          <input
            className="field"
            style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center', fontWeight: 600 }}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="••••••"
            required
          />
          {error && <p className="alert alert-error" style={{ marginTop: 12 }}>{error}</p>}
          {info && <p className="alert alert-success" style={{ marginTop: 12 }}>{info}</p>}
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
          >
            {busy ? 'Verifying…' : 'Log in'}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 18, color: 'var(--muted)' }}>
          Didn’t get it? <button onClick={onResend} className="btn-link">Resend code</button>
        </p>
      </div>
    </div>
  )
}
