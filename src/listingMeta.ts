import type { ListingType } from './types'

// Per-type presentation: label (filter pills), badge (on the photo), colours, and
// the PhotoTile gradient theme. Shared by the listing cards and filters.
export const TYPE_META: Record<
  ListingType,
  { label: string; badge: string; tint: string; ink: string; theme: 'blue' | 'green' | 'amber' | 'purple' | 'teal' }
> = {
  HOTEL: { label: 'Hotels', badge: 'Hotel', tint: '#eff6ff', ink: '#1d4ed8', theme: 'blue' },
  HOMESTAY: { label: 'Homestays', badge: 'Homestay', tint: '#ecfdf5', ink: '#047857', theme: 'green' },
  CAR: { label: 'Taxi', badge: 'Taxi', tint: '#fffbeb', ink: '#b45309', theme: 'amber' },
  BIKE: { label: 'Bikes', badge: 'Bike', tint: '#fdf4ff', ink: '#a21caf', theme: 'purple' },
  SERVICE: { label: 'Services', badge: 'Service', tint: '#f0fdfa', ink: '#0f766e', theme: 'teal' },
}

// "Good to know" facts shown on the detail page, per type. Static, since these
// are policies rather than per-listing data (check-in windows, what's included…).
export const TYPE_DETAILS: Record<ListingType, string[]> = {
  HOTEL: [
    'Check-in 10:00 AM · check-out next-day 10:00 AM',
    'Daily breakfast included',
    'Rate is per room, per night',
    'Free cancellation up to 48 hrs before check-in',
  ],
  HOMESTAY: [
    'Check-in 10:00 AM · check-out next-day 10:00 AM',
    'Home-cooked meals with the host family',
    'Rate is per room, per night',
    'A warm, local stay — basic but clean',
  ],
  CAR: [
    'Comes with a driver — driver charges & fuel included',
    'Pickup from your Leh stay or the airport',
    'Charged per day (10:00 AM to next-day 10:00 AM)',
    'Inner Line Permits arranged for permit zones',
  ],
  BIKE: [
    'Self-drive rental — helmet included',
    'Fuel not included',
    'Charged per day (10:00 AM to next-day 10:00 AM)',
    'Pickup in Leh · valid driving licence + refundable deposit required',
  ],
  SERVICE: [
    'Charged per day of your trip',
    'Available across Leh, Nubra and Pangong',
    'Book alongside a stay, taxi, bike or package',
    'Confirmed once payment is complete',
  ],
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
