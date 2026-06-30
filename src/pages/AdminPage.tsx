import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { createListing, type NewListing } from '../api'
import { useAuth } from '../auth'
import type { ListingType } from '../types'

const TYPES: ListingType[] = ['HOTEL', 'HOMESTAY', 'CAR', 'BIKE']

const input = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  marginTop: 4,
  fontSize: 14,
} as const

function Gate({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem', color: '#4b5563' }}>{children}</div>
}

export default function AdminPage() {
  const { user } = useAuth()
  const [form, setForm] = useState<NewListing>({
    type: 'HOTEL',
    title: '',
    location: '',
    pricePerDay: 0,
    quantity: 1,
    description: '',
  })
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <Gate>
        Please <Link to="/login">log in</Link> to access the admin area.
      </Gate>
    )
  }
  if (user.role !== 'ADMIN') {
    return <Gate>This area is for admins only. You’re logged in as {user.email}.</Gate>
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setBusy(true)
    try {
      const created = await createListing(user!.token, form)
      setMsg(`Added “${created.title}” (id ${created.id}).`)
      setForm({ ...form, title: '', description: '' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ marginTop: 0 }}>Add a listing</h2>
      <p style={{ color: '#6b7280', marginTop: 4 }}>Add Ladakh inventory — a hotel, homestay, car, or bike.</p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          Type
          <select
            style={input}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ListingType })}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          Title
          <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>

        <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          Location
          <input
            style={input}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Leh, Nubra, Pangong…"
            required
          />
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: 14, flex: 1 }}>
            Price / day (₹)
            <input
              style={input}
              type="number"
              min={1}
              value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })}
              required
            />
          </label>
          <label style={{ display: 'block', marginBottom: 12, fontSize: 14, flex: 1 }}>
            Quantity
            <input
              style={input}
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              required
            />
          </label>
        </div>

        <label style={{ display: 'block', marginBottom: 16, fontSize: 14 }}>
          Description
          <textarea
            style={{ ...input, minHeight: 70 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        {msg && <p style={{ color: '#059669', fontSize: 14 }}>{msg}</p>}
        {error && <p style={{ color: 'crimson', fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {busy ? 'Saving…' : 'Add listing'}
        </button>
      </form>
    </div>
  )
}
