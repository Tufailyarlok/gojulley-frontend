import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { createListing, type NewListing } from '../api'
import { useAuth } from '../auth'
import type { ListingType } from '../types'

const TYPES: ListingType[] = ['HOTEL', 'HOMESTAY', 'CAR', 'BIKE']

function Gate({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem', color: 'var(--muted)' }}>{children}</div>
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
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Add a listing</h2>
      <p className="section-sub" style={{ marginBottom: 18 }}>Add Ladakh inventory — a hotel, homestay, car, or bike.</p>

      <form onSubmit={submit} className="card">
        <label className="label">
          Type
          <select
            className="field"
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

        <label className="label">
          Title
          <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>

        <label className="label">
          Location
          <input
            className="field"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Leh, Nubra, Pangong…"
            required
          />
        </label>

        <div className="form-row">
          <label className="label" style={{ flex: 1 }}>
            Price / day (₹)
            <input
              className="field"
              type="number"
              min={1}
              value={form.pricePerDay}
              onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })}
              required
            />
          </label>
          <label className="label" style={{ flex: 1 }}>
            Quantity
            <input
              className="field"
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              required
            />
          </label>
        </div>

        <label className="label">
          Description
          <textarea
            className="field"
            style={{ minHeight: 80, resize: 'vertical' }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        {msg && <p className="alert alert-success" style={{ marginBottom: 14 }}>{msg}</p>}
        {error && <p className="alert alert-error" style={{ marginBottom: 14 }}>{error}</p>}

        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? 'Saving…' : 'Add listing'}
        </button>
      </form>
    </div>
  )
}
