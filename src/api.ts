// One place for all backend calls. Vite proxies /api/* to the Spring Boot
// server (see vite.config.ts), so we use relative URLs here.

import type { Booking, Listing, ListingType, Payment } from './types'

const BASE = '/api/v1'

export interface AuthUser {
  token: string
  email: string
  name: string
  role: 'CUSTOMER' | 'ADMIN'
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

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

// Shared response handler: throws a useful error if the call failed.
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (HTTP ${res.status})`
    try {
      const body = await res.json()
      msg = body?.message || body?.detail || body?.error || msg
    } catch {
      /* no JSON body */
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

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
    await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  )
}

export async function signup(email: string, password: string, name: string): Promise<AuthUser> {
  return handle<AuthUser>(
    await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }),
  )
}

export async function createListing(token: string, data: NewListing): Promise<Listing> {
  return handle<Listing>(
    await fetch(`${BASE}/listings`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  )
}

export async function createBooking(token: string, data: NewBooking): Promise<Booking> {
  return handle<Booking>(
    await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
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

export async function payForBooking(token: string, bookingId: number, idempotencyKey: string): Promise<Payment> {
  return handle<Payment>(
    await fetch(`${BASE}/payments`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ bookingId, idempotencyKey }),
    }),
  )
}
