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
