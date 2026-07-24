import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  adminCancelBooking,
  adminConfirmBooking,
  createCoupon,
  createListing,
  createTripPackage,
  deleteCoupon,
  deleteListing,
  deleteTripPackage,
  getAdminCoupons,
  getAdminStats,
  getAdminTrips,
  getAllBookings,
  getListings,
  updateListing,
  updateTripPackage,
  type NewCoupon,
  type NewListing,
  type NewTripPackage,
} from '../api'
import { useAuth } from '../auth'
import type { AdminStats, Booking, Coupon, CouponType, Listing, ListingType, TripPackage } from '../types'

const TYPES: ListingType[] = ['HOTEL', 'HOMESTAY', 'CAR', 'BIKE']
const EMPTY_FORM: NewListing = {
  type: 'HOTEL',
  title: '',
  location: '',
  pricePerDay: 0,
  quantity: 1,
  description: '',
}

type Tab = 'overview' | 'bookings' | 'listings' | 'trips' | 'coupons'
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'listings', label: 'Listings' },
  { key: 'trips', label: 'Trips' },
  { key: 'coupons', label: 'Coupons' },
]

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

const PAGE_SIZE = 10

// Simple client-side pager for the admin tables (all rows already load at once).
function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE)
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
      <button className="btn btn-outline" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        Prev
      </button>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
        Page {page + 1} of {pages}
      </span>
      <button className="btn btn-outline" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  )
}

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
    { label: 'Total capacity', value: stats.unitsAvailable },
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
  const [page, setPage] = useState(0)

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

  async function confirm(id: number) {
    setBusyId(id)
    setError(null)
    try {
      const updated = await adminConfirmBooking(token, id)
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

  const start = page * PAGE_SIZE
  const pageRows = bookings.slice(start, start + PAGE_SIZE)

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
            {pageRows.map((b) => (
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
                <td style={{ whiteSpace: 'nowrap' }}>
                  {b.status === 'PENDING' && (
                    <button className="btn btn-ok" disabled={busyId === b.id} onClick={() => confirm(b.id)} style={{ marginRight: 6 }}>
                      {busyId === b.id ? '…' : 'Confirm'}
                    </button>
                  )}
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
      <Pager page={page} total={bookings.length} onPage={setPage} />
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
  const [page, setPage] = useState(0)

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
              {listings.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((l) => (
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
      {listings && <Pager page={page} total={listings.length} onPage={setPage} />}
    </>
  )
}

// ---- Trips (manage packages) --------------------------------------------
const EMPTY_TRIP = {
  title: '',
  route: '',
  summary: '',
  durationDays: 1,
  pricePerPerson: 0,
  active: true,
  itinerary: '',
  included: '',
  notIncluded: '',
  items: [] as { listingId: number; quantity: number }[],
}

function TripsTab({ token }: { token: string }) {
  const [packages, setPackages] = useState<TripPackage[] | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [form, setForm] = useState(EMPTY_TRIP)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    getAdminTrips(token)
      .then(setPackages)
      .catch((e) => setError((e as Error).message))
  }, [token])
  useEffect(() => {
    reload()
    getListings()
      .then(setListings)
      .catch(() => {})
  }, [reload])

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_TRIP)
  }

  function startEdit(p: TripPackage) {
    setEditingId(p.id)
    setForm({
      title: p.title,
      route: p.route,
      summary: p.summary ?? '',
      durationDays: p.durationDays,
      pricePerPerson: p.pricePerPerson,
      active: p.active,
      itinerary: p.itinerary.join('\n'),
      included: p.included.join('\n'),
      notIncluded: p.notIncluded.join('\n'),
      items: p.items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
    })
    setMsg(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setItem(idx: number, patch: Partial<{ listingId: number; quantity: number }>) {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }))
  }
  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { listingId: listings[0]?.id ?? 0, quantity: 1 }] }))
  }
  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setBusy(true)
    const payload: NewTripPackage = {
      title: form.title,
      route: form.route,
      summary: form.summary,
      durationDays: form.durationDays,
      pricePerPerson: form.pricePerPerson,
      active: form.active,
      itinerary: form.itinerary.split('\n'),
      included: form.included.split('\n'),
      notIncluded: form.notIncluded.split('\n'),
      items: form.items.filter((i) => i.listingId > 0),
    }
    try {
      if (editingId != null) {
        const u = await updateTripPackage(token, editingId, payload)
        setMsg(`Updated “${u.title}”.`)
      } else {
        const c = await createTripPackage(token, payload)
        setMsg(`Created “${c.title}” (id ${c.id}).`)
      }
      resetForm()
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(p: TripPackage) {
    if (!window.confirm(`Delete “${p.title}”? (Packages with bookings can't be deleted — deactivate instead.)`)) return
    setError(null)
    try {
      await deleteTripPackage(token, p.id)
      if (editingId === p.id) resetForm()
      reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>{editingId != null ? `Edit package #${editingId}` : 'Create a trip package'}</h3>

        <label className="label">
          Title
          <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>

        <div className="form-row">
          <label className="label" style={{ flex: 2 }}>
            Route
            <input
              className="field"
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
              placeholder="Leh · Nubra · Pangong"
              required
            />
          </label>
          <label className="label" style={{ flex: 1 }}>
            Days
            <input className="field" type="number" min={1} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} required />
          </label>
          <label className="label" style={{ flex: 1 }}>
            Price/person (₹)
            <input className="field" type="number" min={1} value={form.pricePerPerson} onChange={(e) => setForm({ ...form, pricePerPerson: Number(e.target.value) })} required />
          </label>
        </div>

        <label className="label">
          Summary
          <textarea className="field" style={{ minHeight: 48, resize: 'vertical' }} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </label>

        <label className="label">
          Itinerary (one line per day)
          <textarea
            className="field"
            style={{ minHeight: 90, resize: 'vertical' }}
            value={form.itinerary}
            onChange={(e) => setForm({ ...form, itinerary: e.target.value })}
            placeholder={'Day 1 — Arrive Leh, rest & acclimatise.\nDay 2 — ...'}
          />
        </label>

        <div className="form-row">
          <label className="label" style={{ flex: 1 }}>
            Included (one per line)
            <textarea className="field" style={{ minHeight: 70, resize: 'vertical' }} value={form.included} onChange={(e) => setForm({ ...form, included: e.target.value })} />
          </label>
          <label className="label" style={{ flex: 1 }}>
            Not included (one per line)
            <textarea className="field" style={{ minHeight: 70, resize: 'vertical' }} value={form.notIncluded} onChange={(e) => setForm({ ...form, notIncluded: e.target.value })} />
          </label>
        </div>

        <div className="label" style={{ marginBottom: 4 }}>What&rsquo;s inside (listings)</div>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          {form.items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="field" style={{ flex: 1, margin: 0 }} value={it.listingId} onChange={(e) => setItem(idx, { listingId: Number(e.target.value) })}>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.type})
                  </option>
                ))}
              </select>
              <input className="field" style={{ width: 80, margin: 0 }} type="number" min={1} value={it.quantity} onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })} />
              <button type="button" className="btn btn-outline" onClick={() => removeItem(idx)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={addItem} style={{ justifySelf: 'start' }}>+ Add listing</button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px', fontSize: 14 }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active (visible to customers)
        </label>

        {msg && <p className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</p>}
        {error && <p className="alert alert-error" style={{ marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : editingId != null ? 'Save changes' : 'Create package'}
          </button>
          {editingId != null && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {!packages ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : packages.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No packages yet — create one above.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Route</th>
                <th>Days</th>
                <th>Price</th>
                <th>Items</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.route}</td>
                  <td>{p.durationDays}</td>
                  <td>{inr(p.pricePerPerson)}</td>
                  <td>{p.items.length}</td>
                  <td>{p.active ? 'Yes' : 'No'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-outline" style={{ marginRight: 6 }} onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => remove(p)}>
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

// ---- Coupons -------------------------------------------------------------
const EMPTY_COUPON = {
  code: '',
  type: 'FLAT' as CouponType,
  value: 0,
  minAmount: '',
  maxDiscount: '',
  firstBookingOnly: false,
  active: true,
  maxRedemptions: '',
}

function CouponsTab({ token }: { token: string }) {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null)
  const [form, setForm] = useState(EMPTY_COUPON)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    getAdminCoupons(token)
      .then(setCoupons)
      .catch((e) => setError((e as Error).message))
  }, [token])
  useEffect(() => {
    reload()
  }, [reload])

  const num = (s: string) => (s.trim() === '' ? null : Number(s))

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    setBusy(true)
    const payload: NewCoupon = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minAmount: num(form.minAmount),
      maxDiscount: form.type === 'PERCENT' ? num(form.maxDiscount) : null,
      firstBookingOnly: form.firstBookingOnly,
      active: form.active,
      expiresAt: null,
      maxRedemptions: num(form.maxRedemptions),
    }
    try {
      const c = await createCoupon(token, payload)
      setMsg(`Created ${c.code}.`)
      setForm(EMPTY_COUPON)
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(c: Coupon) {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return
    setError(null)
    try {
      await deleteCoupon(token, c.id)
      reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Create a coupon</h3>

        <div className="form-row">
          <label className="label" style={{ flex: 2 }}>
            Code
            <input className="field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME500" required />
          </label>
          <label className="label" style={{ flex: 1 }}>
            Type
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}>
              <option value="FLAT">FLAT (₹ off)</option>
              <option value="PERCENT">PERCENT (% off)</option>
            </select>
          </label>
          <label className="label" style={{ flex: 1 }}>
            {form.type === 'FLAT' ? 'Amount (₹)' : 'Percent (%)'}
            <input className="field" type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} required />
          </label>
        </div>

        <div className="form-row">
          <label className="label" style={{ flex: 1 }}>
            Min order (₹, optional)
            <input className="field" type="number" min={0} value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} />
          </label>
          {form.type === 'PERCENT' && (
            <label className="label" style={{ flex: 1 }}>
              Max discount (₹, optional)
              <input className="field" type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            </label>
          )}
          <label className="label" style={{ flex: 1 }}>
            Max redemptions (optional)
            <input className="field" type="number" min={1} value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '4px 0 12px', fontSize: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.firstBookingOnly} onChange={(e) => setForm({ ...form, firstBookingOnly: e.target.checked })} />
            First booking only
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
        </div>

        {msg && <p className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</p>}
        {error && <p className="alert alert-error" style={{ marginBottom: 12 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Create coupon'}
        </button>
      </form>

      {!coupons ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : coupons.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No coupons yet — create one above.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>First-booking</th>
                <th>Active</th>
                <th>Used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === 'FLAT' ? inr(c.value) : `${c.value}%${c.maxDiscount ? ` (max ${inr(c.maxDiscount)})` : ''}`}</td>
                  <td>{c.minAmount ? inr(c.minAmount) : '—'}</td>
                  <td>{c.firstBookingOnly ? 'Yes' : 'No'}</td>
                  <td>{c.active ? 'Yes' : 'No'}</td>
                  <td>{c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-danger" onClick={() => remove(c)}>Delete</button>
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
      {tab === 'trips' && <TripsTab token={user.token} />}
      {tab === 'coupons' && <CouponsTab token={user.token} />}
    </div>
  )
}
