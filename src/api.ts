// One place for all backend calls. Vite proxies /api/* to the Spring Boot
// server (see vite.config.ts), so we use relative URLs here.

import type { Booking, Listing, ListingType } from './types'

const BASE = '/api/v1'

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
  amount: number // paise
  currency: string
  keyId: string
  bookingId: number
  real: boolean // false => mock (skip the gateway popup)
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
    await fetch(`${BASE}/listings`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  )
}

export async function createBooking(token: string, data: NewBooking): Promise<Booking> {
  return handle<Booking>(
    await fetch(`${BASE}/bookings`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  )
}

export async function getMyBookings(token: string): Promise<Booking[]> {
  return handle<Booking[]>(await fetch(`${BASE}/bookings`, { headers: authHeaders(token) }))
}

export async function cancelBooking(token: string, id: number): Promise<Booking> {
  return handle<Booking>(
    await fetch(`${BASE}/bookings/${id}/cancel`, { method: 'POST', headers: authHeaders(token) }),
  )
}

// --- Payments (Razorpay) ---
export async function createPaymentOrder(token: string, bookingId: number): Promise<PaymentOrder> {
  return handle<PaymentOrder>(
    await fetch(`${BASE}/payments/order`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ bookingId }) }),
  )
}

export async function verifyPayment(
  token: string,
  data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<void> {
  return handleNoBody(
    await fetch(`${BASE}/payments/verify`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) }),
  )
}
