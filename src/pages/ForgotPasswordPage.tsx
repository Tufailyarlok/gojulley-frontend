import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../api'
import { useAuth } from '../auth'

// Two-step reset: enter email -> emailed a RESET code -> enter code + new
// password. On success the backend logs the user straight in.
export default function ForgotPasswordPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = (location.state as { email?: string } | null)?.email ?? ''

  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState(prefill)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function requestCode(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      await forgotPassword(email)
      setInfo('If an account exists for that email, a reset code has been sent.')
      setStep('reset')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function doReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user = await resetPassword(email, code.trim(), password)
      setUser(user)
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3.5rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 4 }}>Reset your password</h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>
          {step === 'request'
            ? 'Enter your email and we’ll send you a reset code.'
            : 'Enter the code we emailed you and choose a new password.'}
        </p>

        {step === 'request' ? (
          <form onSubmit={requestCode}>
            <label className="label" style={{ marginBottom: 18 }}>
              Email
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            {error && <p className="alert alert-error" style={{ marginBottom: 14 }}>{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary btn-block">
              {busy ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={doReset}>
            {info && <p className="alert alert-success" style={{ marginBottom: 14 }}>{info}</p>}
            <label className="label">
              Reset code
              <input
                className="field"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="6-digit code"
                required
              />
            </label>
            <label className="label" style={{ marginBottom: 18 }}>
              New password
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            {error && <p className="alert alert-error" style={{ marginBottom: 14 }}>{error}</p>}
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="btn btn-primary btn-block"
            >
              {busy ? 'Resetting…' : 'Set new password & log in'}
            </button>
            <p style={{ fontSize: 14, marginTop: 16, color: 'var(--muted)' }}>
              Didn’t get a code?{' '}
              <button type="button" className="btn-link" onClick={() => setStep('request')}>
                Try a different email
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
