'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  quantity: number
  product: { id: string; name: string; price: number | string; imageUrl: string }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const COURIERS = ['Pos Laju', 'J&T Express', 'DHL', 'GDEX', 'Ninja Van', 'Shopee Express']
const STATES = ['Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Wilayah Persekutuan Kuala Lumpur', 'Wilayah Persekutuan Labuan', 'Wilayah Persekutuan Putrajaya']

const inputCls = 'w-full rounded border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-600'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: items, isLoading } = useSWR<CartItem[]>('/api/cart', fetcher)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPostcode: '',
    preferredCourier: 'Pos Laju',
  })

  const subtotal = (items ?? []).reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Create order with shipping details
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!orderRes.ok) {
        const data = await orderRes.json()
        setError(data.details?.[0] ?? data.error ?? 'Failed to create order')
        setLoading(false)
        return
      }
      const { orderId } = await orderRes.json()

      // Create payment
      const payRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!payRes.ok) {
        const payData = await payRes.json()
        setError(`Payment error: ${payData.detail ?? payData.error ?? 'Please try again.'}`)
        setLoading(false)
        return
      }
      const { billUrl } = await payRes.json()
      router.push(billUrl)
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  if (isLoading) return <main className="mx-auto max-w-4xl px-6 py-10 text-gray-400">Loading…</main>
  if (!items || items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10" style={{ color: 'white' }}>
      <h1 className="mb-8 text-2xl font-light tracking-[0.15em]" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shipping form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Shipping Details</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Full Name</label>
            <input value={form.shippingName} onChange={e => setForm({ ...form, shippingName: e.target.value })}
              required placeholder="Your full name" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Phone Number</label>
            <input value={form.shippingPhone} onChange={e => setForm({ ...form, shippingPhone: e.target.value })}
              required placeholder="e.g. 0123456789" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Address</label>
            <textarea value={form.shippingAddress} onChange={e => setForm({ ...form, shippingAddress: e.target.value })}
              required rows={2} placeholder="Street address, unit number" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">City</label>
              <input value={form.shippingCity} onChange={e => setForm({ ...form, shippingCity: e.target.value })}
                required placeholder="City" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Postcode</label>
              <input value={form.shippingPostcode} onChange={e => setForm({ ...form, shippingPostcode: e.target.value })}
                required placeholder="50000" className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">State</label>
            <select value={form.shippingState} onChange={e => setForm({ ...form, shippingState: e.target.value })}
              required className={inputCls}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Preferred Courier</label>
            <select value={form.preferredCourier} onChange={e => setForm({ ...form, preferredCourier: e.target.value })}
              required className={inputCls}>
              {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Order summary */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Order Summary</h2>
          <div className="rounded-lg border border-yellow-900/30 p-4 flex flex-col gap-3" style={{ backgroundColor: '#0f0f0f' }}>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-300">
                <span>{item.product.name} × {item.quantity}</span>
                <span>RM {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-yellow-900/30 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>RM {subtotal.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded py-3 text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-50 hover:brightness-110"
            style={{ backgroundColor: 'var(--gold)', color: '#0A0A0A' }}>
            {loading ? 'Processing…' : 'Proceed to Payment'}
          </button>
          <p className="text-xs text-gray-600 text-center">You will be redirected to the payment page</p>
        </div>
      </form>
    </main>
  )
}
