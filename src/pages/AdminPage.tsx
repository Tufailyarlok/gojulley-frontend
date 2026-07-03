import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  adminCancelBooking,
  createListing,
  deleteListing,
  getAdminStats,
  getAllBookings,
  getListings,
  updateListing,
  type NewListing,
} from '../api'
import { useAuth } from '../auth'
import type { AdminStats, Booking, Listing, ListingType } from '../types'

const TYPES: ListingType[] = ['HOTEL', 'HOMESTAY', 'CAR', 'BIKE']
const EMPTY_FORM: NewListing = {
  type: 'HOTEL',
  title: '',
  location: '',
  pricePerDay: 0,
  quantity: 1,
  description: '',
}

type Tab = 'overview' | 'bookings' | 'listings'
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'listings', label: 'Listings' },
]

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

function Gate({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 600, margin: '3rem auto', padding: '0 1rem', color: 'var(--muted)' }}>{children}</div>
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}

// ---- Overview ------------------------------------------------------------
function OverviewTab({ token }: { token: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminStats(token)
      .then(setStats)
      .catch((e) => setError((e as Error).message))
  }, [token])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!stats) return <p style={{ color: 'var(--muted)' }}>Loading…</p>

  const cards: { label: string; value: string | number }[] = [
    { label: 'Total bookings', value: stats.totalBookings },
    { label: 'Confirmed', value: stats.confirmedBookings },
    { label: 'Revenue (confirmed)', value: inr(stats.confirmedRevenue) },
    { label: 'Listings', value: stats.totalListings },
    { label: 'Units available', value: stats.unitsAvailable },
    { label: 'Pending payments', value: stats.pendingPayments },
  ]

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

// ---- Bookings ------------------------------------------------------------
function BookingsTab({ token }: { token: string }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    getAllBookings(token)
      .then(setBookings)
      .catch((e) => setError((e as Error).message))
  }, [token])

  async function cancel(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const updated = await adminCancelBooking(token, id)
      setBookings((bs) => bs?.map((b) => (b.id === id ? updated : b)) ?? null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  if (!bookings && error) return <p className="alert alert-error">{error}</p>
  if (!bookings) return <p style={{ color: 'var(--muted)' }}>Loading…</p>
  if (bookings.length === 0) return <p style={{ color: 'var(--muted)' }}>No bookings yet.</p>

  return (
    <>
      {error && <p className="alert alert-error" style={{ marginBottom: 14 }}>{error}</p>}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Listing</th>
              <th>Customer</th>
              <th>Dates</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.listingTitle}</td>
                <td>{b.userEmail}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {b.startDate} → {b.endDate}
                </td>
                <td>{b.quantity}</td>
                <td>{inr(b.totalPrice)}</td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
                <td>
                  {b.status !== 'CANCELLED' && (
                    <button className="btn btn-danger" disabled={busyId === b.id} onClick={() => cancel(b.id)}>
                      {busyId === b.id ? '…' : 'Cancel'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ---- Listings ------------------------------------------------------------
function ListingsTab({ token }: { token: string }) {
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [form, setForm] = useState<NewListing>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function reload() {
    getListings()
      .then(setListings)
      .catch((e) => setError((e as Error).message))
  }
  useEffect(() => {
    reload()
  }, [])

  function startEdit(l: Listing) {
    setEditingId(l.id)
    setForm({
      type: l.type,
      title: l.title,
      location: l.location,
      pricePerDay: l.pricePerDay,
      quantity: l.quantity,
      description: l.description,
    })
    setMsg(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setBusy(true)
    try {
      if (editingId != null) {
        const updated = await updateListing(token, editingId, form)
        setMsg(`Updated “${updated.title}”.`)
      } else {
        const created = await createListing(token, form)
        setMsg(`Added “${created.title}” (id ${created.id}).`)
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(l: Listing) {
    if (!window.confirm(`Delete “${l.title}”? This cannot be undone.`)) return
    setError(null)
    try {
      await deleteListing(token, l.id)
      if (editingId === l.id) cancelEdit()
      reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>{editingId != null ? `Edit listing #${editingId}` : 'Add a listing'}</h3>

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

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? 'Saving…' : editingId != null ? 'Save changes' : 'Add listing'}
          </button>
          {editingId != null && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {!listings ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : listings.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No listings yet — add one above.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Title</th>
                <th>Location</th>
                <th>Price/day</th>
                <th>Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>
                    <span className="type-badge">{l.type}</span>
                  </td>
                  <td>{l.title}</td>
                  <td>{l.location}</td>
                  <td>{inr(l.pricePerDay)}</td>
                  <td>{l.quantity}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-outline" onClick={() => startEdit(l)} style={{ marginRight: 6 }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => remove(l)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ---- Page shell ----------------------------------------------------------
export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')

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

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Admin dashboard</h2>
      <p className="section-sub" style={{ marginBottom: 18 }}>Manage GoJulley — overview, bookings, and listings.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`filter-pill${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab token={user.token} />}
      {tab === 'bookings' && <BookingsTab token={user.token} />}
      {tab === 'listings' && <ListingsTab token={user.token} />}
    </div>
  )
}
