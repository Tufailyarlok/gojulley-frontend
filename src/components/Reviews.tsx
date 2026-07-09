import { useEffect, useState } from 'react'
import { createReview, getReviews } from '../api'
import { useAuth } from '../auth'
import Stars from './Stars'
import type { Review } from '../types'

// Reviews list + average + write-a-review form for a listing.
// Used on the listing detail page (and reusable anywhere).
export default function Reviews({ listingId }: { listingId: number }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState(false)

  useEffect(() => {
    getReviews(listingId)
      .then(setReviews)
      .catch(() => {})
  }, [listingId])

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  async function submit() {
    if (!user || rating === 0) return
    setBusy(true)
    setError(null)
    try {
      const r = await createReview(user.token, { listingId, rating, comment })
      setReviews((rs) => [r, ...rs])
      setPosted(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Reviews</h3>
        {reviews.length > 0 && (
          <>
            <Stars value={avg} size={16} />
            <span style={{ fontSize: 14, color: 'var(--faint)' }}>{avg.toFixed(1)} · {reviews.length}</span>
          </>
        )}
      </div>

      {reviews.length === 0 && <p style={{ fontSize: 14, color: 'var(--faint)', margin: '0 0 14px' }}>No reviews yet — be the first.</p>}

      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 14 }}>{r.userName}</strong>
              <Stars value={r.rating} size={13} />
            </div>
            {r.comment && <p style={{ fontSize: 14, color: 'var(--muted)', margin: '4px 0 0' }}>{r.comment}</p>}
          </div>
        ))}
      </div>

      {!user ? (
        <p style={{ fontSize: 14, color: 'var(--faint)' }}>Log in to write a review.</p>
      ) : posted ? (
        <p style={{ fontSize: 14, color: 'var(--ok)', fontWeight: 700 }}>Thanks for your review!</p>
      ) : (
        <div className="card" style={{ background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Your rating</span>
            <Stars value={rating} size={24} onChange={setRating} />
          </div>
          <textarea
            className="field"
            style={{ minHeight: 64, resize: 'vertical' }}
            placeholder="Share a few words (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="alert alert-error" style={{ marginTop: 8 }}>{error}</p>}
          <button type="button" className="btn btn-primary" style={{ marginTop: 8 }} disabled={busy || rating === 0} onClick={submit}>
            {busy ? 'Posting…' : 'Post review'}
          </button>
        </div>
      )}
    </div>
  )
}
