// Maps listings & trips to the bundled Ladakh photos (served from /public/photos).
// Matches seeded items by title, with a sensible per-type / per-index fallback
// so admin-created items still get a fitting image.
import type { Listing, TripPackage } from './types'

const P = (n: number) => `/photos/ladakh${n}.jpg`

const TYPE_FALLBACK: Record<string, string> = {
  HOTEL: P(2), // hilltop monastery-town
  HOMESTAY: P(3), // clifftop village
  CAR: P(4), // cars on the road
  BIKE: P(1), // bikers on a mountain road
}

export function listingPhoto(l: Listing): string {
  const t = l.title.toLowerCase()
  if (t.includes('grand dragon')) return P(2)
  if (t.includes('nubra')) return P(3)
  if (t.includes('pangong')) return P(7) // sweeping valley
  if (t.includes('innova')) return P(4)
  if (t.includes('enfield')) return P(1)
  return TYPE_FALLBACK[l.type] ?? P(7)
}

export function tripPhoto(t: TripPackage, index = 0): string {
  const s = t.title.toLowerCase()
  if (s.includes('bike')) return P(1)
  if (s.includes('zanskar') || s.includes('explorer')) return P(6) // snow leopard
  if (s.includes('classic') || s.includes('circuit')) return P(5) // high pass
  return [P(5), P(1), P(7)][index % 3]
}
