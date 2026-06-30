// Shared types that mirror the backend's data shapes.

export type ListingType = 'HOTEL' | 'HOMESTAY' | 'CAR' | 'BIKE'

export interface Listing {
  id: number
  type: ListingType
  title: string
  location: string
  pricePerDay: number
  quantity: number
  description: string
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export interface Booking {
  id: number
  listingId: number
  listingTitle: string
  userEmail: string
  startDate: string
  endDate: string
  quantity: number
  totalPrice: number
  status: BookingStatus
}
