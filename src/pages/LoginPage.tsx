import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, signup as apiSignup } from '../api'
import { useAuth } from '../auth'

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  marginTop: 4,
  fontSize: 14,
} as const

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
      const user =
        mode === 'login' ? await apiLogin(email, password) : await apiSignup(email, password, name)
      setUser(user)
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '3rem auto', padding: '0 1rem' }}>
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
            Name
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          Email
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: 'block', marginBottom: 16, fontSize: 14 }}>
          Password
          <input
            style={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p style={{ color: 'crimson', fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <p style={{ fontSize: 14, marginTop: 16, color: '#6b7280' }}>
        {mode === 'login' ? "No account? " : 'Have an account? '}
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
          }}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: 14 }}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>

      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
        Demo admin: admin@tripstack.local / admin123
      </p>
    </div>
  )
}
