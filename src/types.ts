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

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

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

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface Payment {
  id: number
  bookingId: number
  amount: number
  status: PaymentStatus
  providerPaymentId: string | null
}
