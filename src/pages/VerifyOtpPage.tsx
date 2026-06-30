import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resendOtp, verifyOtp } from '../api'
import { useAuth } from '../auth'

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  marginTop: 4,
  fontSize: 18,
  letterSpacing: 4,
  textAlign: 'center' as const,
}

export default function VerifyOtpPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!email) {
    return (
      <div style={{ maxWidth: 420, margin: '3rem auto', padding: '0 1rem', color: '#4b5563' }}>
        Please <Link to="/login">sign up or log in</Link> first.
      </div>
    )
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user = await verifyOtp(email, code.trim())
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
      await resendOtp(email)
      setInfo('A new code has been sent.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '3rem auto', padding: '0 1rem' }}>
      <h2>Verify your email</h2>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
      </p>

      <form onSubmit={submit}>
        <input
          style={input}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          placeholder="••••••"
          required
        />
        {error && <p style={{ color: 'crimson', fontSize: 14 }}>{error}</p>}
        {info && <p style={{ color: '#059669', fontSize: 14 }}>{info}</p>}
        <button
          type="submit"
          disabled={busy || code.length < 6}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 12,
            borderRadius: 8,
            border: 'none',
            background: busy || code.length < 6 ? '#93c5fd' : '#2563eb',
            color: '#fff',
            fontSize: 15,
            cursor: busy || code.length < 6 ? 'default' : 'pointer',
          }}
        >
          {busy ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <p style={{ fontSize: 14, marginTop: 16, color: '#6b7280' }}>
        Didn’t get it?{' '}
        <button
          onClick={onResend}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 14 }}
        >
          Resend code
        </button>
      </p>
    </div>
  )
}
