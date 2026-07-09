// One place for all backend calls. Vite proxies /api/* to the Spring Boot
// server (see vite.config.ts), so we use relative URLs here.

import type { AdminStats, Booking, Coupon, Listing, ListingType, PublicCoupon, Review, ReviewSummary, TripBooking, TripPackage } from './types'

// Local dev: VITE_API_URL is unset, so calls go to '/api/v1' (Vite proxy).
// Production: set VITE_API_URL to the backend's public URL at build time.
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'

export interface AuthUser {
  token: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
}

export interface SignupResponse {
  email: string
  message: string
}

export interface NewListing {
  type: ListingType
  title: string
  location: string
  pricePerDay: number
  quantity: number
  description: string
}

export interface NewBooking {
  listingId: number
  startDate: string
  endDate: string
  quantity: number
}

export interface PaymentOrder {
  razorpayOrderId: string
  amount: number // final amount to pay, in paise (after discount)
  currency: string
  keyId: string
  bookingId: number
  real: boolean // false => mock (skip the gateway popup)
  originalAmount: number // pre-discount, paise
  discount: number // paise (0 if no coupon)
  couponCode: string | null
}

// Error that also carries the HTTP status, so callers can branch on it.
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// The app (see auth.tsx) registers a handler here so the API layer can force a
// re-login when the stored token is expired/invalid. Both cases surface as an
// auth failure on an authenticated call, which the backend returns as either a
// 401 or a 403 with the message "Access Denied".
let onAuthError: (() => void) | null = null
export function setAuthErrorHandler(fn: (() => void) | null) {
  onAuthError = fn
}

// Every authenticated request goes through here. If the token is rejected, we
// fire onAuthError once — but we DON'T treat a legitimate business 403 (e.g.
// "Not your booking") as a session failure, only Spring Security's "Access
// Denied" (or a 401).
async function authedFetch(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(token), ...(init.headers as Record<string, string> | undefined) },
  })
  if (res.status === 401 || res.status === 403) {
    let authFailed = res.status === 401
    if (res.status === 403) {
      try {
        const body = await res.clone().json()
        authFailed = body?.message === 'Access Denied'
      } catch {
        authFailed = true // opaque 403 with no JSON body -> treat as auth failure
      }
    }
    if (authFailed) onAuthError?.()
  }
  return res
}

async function readError(res: Response): Promise<string> {
  let msg = `Request failed (HTTP ${res.status})`
  try {
    const body = await res.json()
    msg = body?.message || body?.detail || body?.error || msg
  } catch {
    /* no JSON body */
  }
  return msg
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ApiError(await readError(res), res.status)
  return res.json() as Promise<T>
}

async function handleNoBody(res: Response): Promise<void> {
  if (!res.ok) throw new ApiError(await readError(res), res.status)
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export async function getListings(params?: {
  location?: string
  type?: ListingType
}): Promise<Listing[]> {
  const qs = new URLSearchParams()
  if (params?.location) qs.set('location', params.location)
  if (params?.type) qs.set('type', params.type)
  const url = `${BASE}/listings${qs.toString() ? `?${qs.toString()}` : ''}`
  return handle<Listing[]>(await fetch(url))
}

export async function getListing(id: number): Promise<Listing> {
  return handle<Listing>(await fetch(`${BASE}/listings/${id}`))
}

export async function login(email: string, password: string): Promise<AuthUser> {
  return handle<AuthUser>(
    await fetch(`${BASE}/auth/login`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, password }) }),
  )
}

export async function signup(email: string, password: string, name: string): Promise<SignupResponse> {
  return handle<SignupResponse>(
    await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, password, name }) }),
  )
}

export async function verifyOtp(email: string, code: string): Promise<AuthUser> {
  return handle<AuthUser>(
    await fetch(`${BASE}/auth/verify-otp`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email, code }) }),
  )
}

export async function resendOtp(email: string): Promise<SignupResponse> {
  return handle<SignupResponse>(
    await fetch(`${BASE}/auth/resend-otp`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ email }) }),
  )
}

export async function createListing(token: string, data: NewListing): Promise<Listing> {
  return handle<Listing>(
    await authedFetch(token, `${BASE}/listings`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

export async function createBooking(token: string, data: NewBooking): Promise<Booking> {
  return handle<Booking>(
    await authedFetch(token, `${BASE}/bookings`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

export async function getMyBookings(token: string): Promise<Booking[]> {
  return handle<Booking[]>(await authedFetch(token, `${BASE}/bookings`))
}

export async function updateListing(token: string, id: number, data: NewListing): Promise<Listing> {
  return handle<Listing>(
    await authedFetch(token, `${BASE}/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  )
}

export async function deleteListing(token: string, id: number): Promise<void> {
  return handleNoBody(await authedFetch(token, `${BASE}/listings/${id}`, { method: 'DELETE' }))
}

// --- Trips (curated packages) ---
export interface NewTripBooking {
  packageId: number
  startDate: string
  travelers: number
}

export async function getTrips(): Promise<TripPackage[]> {
  return handle<TripPackage[]>(await fetch(`${BASE}/trips`))
}

export async function getTrip(id: number): Promise<TripPackage> {
  return handle<TripPackage>(await fetch(`${BASE}/trips/${id}`))
}

export async function createTripBooking(token: string, data: NewTripBooking): Promise<TripBooking> {
  return handle<TripBooking>(
    await authedFetch(token, `${BASE}/trip-bookings`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

export async function getMyTrips(token: string): Promise<TripBooking[]> {
  return handle<TripBooking[]>(await authedFetch(token, `${BASE}/trip-bookings`))
}

export async function cancelTripBooking(token: string, id: number): Promise<TripBooking> {
  return handle<TripBooking>(
    await authedFetch(token, `${BASE}/trip-bookings/${id}/cancel`, { method: 'POST' }),
  )
}

export async function createTripPaymentOrder(token: string, tripBookingId: number, couponCode?: string): Promise<PaymentOrder> {
  return handle<PaymentOrder>(
    await authedFetch(token, `${BASE}/trip-payments/order`, { method: 'POST', body: JSON.stringify({ tripBookingId, couponCode }) }),
  )
}

export async function verifyTripPayment(
  token: string,
  data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<void> {
  return handleNoBody(
    await authedFetch(token, `${BASE}/trip-payments/verify`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

// --- Admin: manage trip packages ---
export interface NewTripPackage {
  title: string
  route: string
  summary: string
  durationDays: number
  pricePerPerson: number
  active: boolean
  itinerary: string[]
  included: string[]
  notIncluded: string[]
  items: { listingId: number; quantity: number }[]
}

export async function getAdminTrips(token: string): Promise<TripPackage[]> {
  return handle<TripPackage[]>(await authedFetch(token, `${BASE}/admin/trips`))
}

export async function createTripPackage(token: string, data: NewTripPackage): Promise<TripPackage> {
  return handle<TripPackage>(
    await authedFetch(token, `${BASE}/admin/trips`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

export async function updateTripPackage(token: string, id: number, data: NewTripPackage): Promise<TripPackage> {
  return handle<TripPackage>(
    await authedFetch(token, `${BASE}/admin/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  )
}

export async function deleteTripPackage(token: string, id: number): Promise<void> {
  return handleNoBody(await authedFetch(token, `${BASE}/admin/trips/${id}`, { method: 'DELETE' }))
}

// --- Coupons ---
export interface CouponPreview {
  code: string
  discount: number
  finalAmount: number
  message: string
}

export interface NewCoupon {
  code: string
  type: 'FLAT' | 'PERCENT'
  value: number
  minAmount: number | null
  maxDiscount: number | null
  firstBookingOnly: boolean
  active: boolean
  expiresAt: string | null
  maxRedemptions: number | null
}

/** Customer preview: does this code work on this total, and what's the saving? */
export async function previewCoupon(token: string, code: string, amount: number): Promise<CouponPreview> {
  return handle<CouponPreview>(
    await authedFetch(token, `${BASE}/coupons/preview`, { method: 'POST', body: JSON.stringify({ code, amount }) }),
  )
}

/** Available offers for the checkout dropdown. */
export async function getCoupons(token: string): Promise<PublicCoupon[]> {
  return handle<PublicCoupon[]>(await authedFetch(token, `${BASE}/coupons`))
}

export async function getAdminCoupons(token: string): Promise<Coupon[]> {
  return handle<Coupon[]>(await authedFetch(token, `${BASE}/admin/coupons`))
}

export async function createCoupon(token: string, data: NewCoupon): Promise<Coupon> {
  return handle<Coupon>(
    await authedFetch(token, `${BASE}/admin/coupons`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

export async function deleteCoupon(token: string, id: number): Promise<void> {
  return handleNoBody(await authedFetch(token, `${BASE}/admin/coupons/${id}`, { method: 'DELETE' }))
}

// --- Reviews ---
export async function getReviewSummaries(): Promise<ReviewSummary[]> {
  return handle<ReviewSummary[]>(await fetch(`${BASE}/reviews/summary`))
}

export async function getReviews(listingId: number): Promise<Review[]> {
  return handle<Review[]>(await fetch(`${BASE}/reviews?listingId=${listingId}`))
}

export async function createReview(
  token: string,
  data: { listingId: number; rating: number; comment: string },
): Promise<Review> {
  return handle<Review>(
    await authedFetch(token, `${BASE}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  )
}

// --- Admin dashboard ---
export async function getAdminStats(token: string): Promise<AdminStats> {
  return handle<AdminStats>(await authedFetch(token, `${BASE}/admin/stats`))
}

export async function getAllBookings(token: string): Promise<Booking[]> {
  return handle<Booking[]>(await authedFetch(token, `${BASE}/admin/bookings`))
}

export async function adminCancelBooking(token: string, id: number): Promise<Booking> {
  return handle<Booking>(await authedFetch(token, `${BASE}/admin/bookings/${id}/cancel`, { method: 'POST' }))
}

export async function cancelBooking(token: string, id: number): Promise<Booking> {
  return handle<Booking>(
    await authedFetch(token, `${BASE}/bookings/${id}/cancel`, { method: 'POST' }),
  )
}

// --- Payments (Razorpay) ---
export async function createPaymentOrder(token: string, bookingId: number, couponCode?: string): Promise<PaymentOrder> {
  return handle<PaymentOrder>(
    await authedFetch(token, `${BASE}/payments/order`, { method: 'POST', body: JSON.stringify({ bookingId, couponCode }) }),
  )
}

export async function verifyPayment(
  token: string,
  data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<void> {
  return handleNoBody(
    await authedFetch(token, `${BASE}/payments/verify`, { method: 'POST', body: JSON.stringify(data) }),
  )
}
