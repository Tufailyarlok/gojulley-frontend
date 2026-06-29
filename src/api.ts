// One place for all backend calls. Vite proxies /api/* to the Spring Boot
// server (see vite.config.ts), so we can use relative URLs here.

import type { Listing, ListingType } from './types'

const BASE = '/api/v1'

export async function getListings(params?: {
  location?: string
  type?: ListingType
}): Promise<Listing[]> {
  const qs = new URLSearchParams()
  if (params?.location) qs.set('location', params.location)
  if (params?.type) qs.set('type', params.type)

  const url = `${BASE}/listings${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<Listing[]>
}
