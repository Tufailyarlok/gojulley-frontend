import type { ListingType } from './types'

// Per-type presentation: label (filter pills), badge (on the photo), colours, and
// the PhotoTile gradient theme. Shared by the listing cards and filters.
export const TYPE_META: Record<
  ListingType,
  { label: string; badge: string; tint: string; ink: string; theme: 'blue' | 'green' | 'amber' | 'purple' }
> = {
  HOTEL: { label: 'Hotels', badge: 'Hotel', tint: '#eff6ff', ink: '#1d4ed8', theme: 'blue' },
  HOMESTAY: { label: 'Homestays', badge: 'Homestay', tint: '#ecfdf5', ink: '#047857', theme: 'green' },
  CAR: { label: 'Cars / Taxi', badge: 'Car / Taxi', tint: '#fffbeb', ink: '#b45309', theme: 'amber' },
  BIKE: { label: 'Bikes', badge: 'Bike', tint: '#fdf4ff', ink: '#a21caf', theme: 'purple' },
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
