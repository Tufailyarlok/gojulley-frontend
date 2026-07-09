// Shared types that mirror the backend's data shapes.

export type ListingType = 'HOTEL' | 'HOMESTAY' | 'CAR' | 'BIKE' | 'EXPERIENCE'

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

// A component of a trip package ("what's inside").
export interface PackageItem {
  listingId: number
  listingTitle: string
  type: ListingType
  quantity: number
}

// A curated, all-inclusive trip (bundle of listings sold as one product).
export interface TripPackage {
  id: number
  title: string
  route: string
  summary: string
  durationDays: number
  pricePerPerson: number
  active: boolean
  itinerary: string[]
  included: string[]
  notIncluded: string[]
  items: PackageItem[]
}

// A booking of a whole trip package.
export interface TripBooking {
  id: number
  packageId: number | null
  packageTitle: string
  userEmail: string
  startDate: string
  travelers: number
  totalPrice: number
  status: BookingStatus
}

export interface Review {
  id: number
  listingId: number
  userName: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface ReviewSummary {
  listingId: number
  average: number
  count: number
}

export type CouponType = 'FLAT' | 'PERCENT'

// A coupon offer shown to customers in the checkout dropdown.
export interface PublicCoupon {
  code: string
  description: string
  firstBookingOnly: boolean
}

export interface Coupon {
  id: number
  code: string
  type: CouponType
  value: number
  minAmount: number | null
  maxDiscount: number | null
  firstBookingOnly: boolean
  active: boolean
  expiresAt: string | null
  maxRedemptions: number | null
  timesRedeemed: number
}

// Overview numbers for the admin dashboard (mirrors backend AdminStats).
export interface AdminStats {
  totalBookings: number
  confirmedBookings: number
  confirmedRevenue: number
  totalListings: number
  unitsAvailable: number
  pendingPayments: number
}
