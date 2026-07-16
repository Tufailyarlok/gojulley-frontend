import { useEffect, useState } from 'react'
import { getMe, setTwoFactor } from '../api'
import { useAuth } from '../auth'

// Account security: lets the signed-in user turn email-OTP two-factor login
// on or off. Self-contained (fetches its own state) so it can drop into any
// logged-in page.
export default function SecurityCard() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getMe(user.token)
      .then((me) => setEnabled(me.twoFactorEnabled))
      .catch((e) => setError((e as Error).message))
  }, [user])

  if (!user) return null

  async function toggle() {
    if (!user || enabled === null) return
    setBusy(true)
    setError(null)
    try {
      const me = await setTwoFactor(user.token, !enabled)
      setEnabled(me.twoFactorEnabled)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>Account security</h3>
      <p className="section-sub" style={{ marginBottom: 16 }}>
        Two-factor login emails you a one-time code after your password — so a stolen password isn’t enough on its own.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontWeight: 600 }}>
          Two-factor login:{' '}
          <span style={{ color: enabled ? 'var(--success, #15803d)' : 'var(--muted)' }}>
            {enabled === null ? '…' : enabled ? 'On' : 'Off'}
          </span>
        </span>
        <button
          className={`btn ${enabled ? 'btn-outline' : 'btn-primary'}`}
          style={{ padding: '6px 16px' }}
          disabled={busy || enabled === null}
          onClick={toggle}
        >
          {busy ? 'Saving…' : enabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>
      {error && <p className="alert alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{error}</p>}
    </div>
  )
}
