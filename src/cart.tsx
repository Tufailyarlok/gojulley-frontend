import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Listing, ListingType } from './types'

// A line in the cart. We snapshot the display fields so the cart renders without
// re-fetching; quantity is the number of units of this listing.
export interface CartItem {
  listingId: number
  title: string
  type: ListingType
  pricePerDay: number
  quantity: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  add: (listing: Listing, qty?: number) => void
  setQty: (listingId: number, qty: number) => void
  remove: (listingId: number) => void
  clear: () => void
  has: (listingId: number) => boolean
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'gojulley_cart'

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  function add(listing: Listing, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.listingId === listing.id)
      if (existing) {
        return prev.map((i) => (i.listingId === listing.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [
        ...prev,
        { listingId: listing.id, title: listing.title, type: listing.type, pricePerDay: listing.pricePerDay, quantity: qty },
      ]
    })
  }
  function setQty(listingId: number, qty: number) {
    setItems((prev) => prev.map((i) => (i.listingId === listingId ? { ...i, quantity: Math.max(1, qty) } : i)))
  }
  function remove(listingId: number) {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId))
  }
  function clear() {
    setItems([])
  }
  const count = items.reduce((n, i) => n + i.quantity, 0)
  const has = (listingId: number) => items.some((i) => i.listingId === listingId)

  return <Ctx.Provider value={{ items, count, add, setQty, remove, clear, has }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used within CartProvider')
  return c
}
