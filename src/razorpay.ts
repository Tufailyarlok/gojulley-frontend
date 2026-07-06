// Shared Razorpay checkout: load the script on demand and run a payment for an
// already-created order. Used by both à-la-carte bookings and trip bookings.
import type { PaymentOrder } from './api'

export interface RazorpayResult {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/**
 * Run checkout for an existing order. In mock mode (order.real === false) it
 * skips the popup and verifies directly. `verify` performs the backend verify
 * call (payments or trip-payments), so this helper is payment-type agnostic.
 */
export async function payWithRazorpay(opts: {
  order: PaymentOrder
  user: { email: string; name: string }
  description: string
  verify: (result: RazorpayResult) => Promise<void>
  onSuccess: () => void
  onError: (message: string) => void
}): Promise<void> {
  const { order, user, description, verify, onSuccess, onError } = opts

  // Dev / no keys: skip the gateway popup and confirm directly.
  if (!order.real) {
    try {
      await verify({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: 'mock_pay',
        razorpaySignature: 'mock_sig',
      })
      onSuccess()
    } catch (err) {
      onError((err as Error).message)
    }
    return
  }

  const ok = await loadRazorpay()
  if (!ok) {
    onError('Could not load the payment gateway.')
    return
  }

  const RazorpayCtor = (
    window as unknown as {
      Razorpay: new (o: object) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }
    }
  ).Razorpay

  const rzp = new RazorpayCtor({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.razorpayOrderId,
    name: 'GoJulley',
    description,
    prefill: { email: user.email, name: user.name },
    theme: { color: '#2563eb' },
    handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      try {
        await verify({
          razorpayOrderId: resp.razorpay_order_id,
          razorpayPaymentId: resp.razorpay_payment_id,
          razorpaySignature: resp.razorpay_signature,
        })
        onSuccess()
      } catch (err) {
        onError((err as Error).message)
      }
    },
  }) as { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }

  rzp.on('payment.failed', () => onError('Payment failed. Please try again.'))
  rzp.open()
}
