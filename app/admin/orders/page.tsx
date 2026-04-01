'use client'

import { useState } from 'react'
import useSWR from 'swr'

export const dynamic = 'force-dynamic'

interface OrderItem { id: string; quantity: number; price: string | number; product: { name: string } }
interface Order {
  id: string
  status: string
  totalPrice: string | number
  createdAt: string
  trackingNumber?: string
  courierName?: string
  shippedAt?: string
  user: { name: string; email: string }
  items: OrderItem[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusColor: Record<string, string> = {
  PENDING: 'text-yellow-400',
  PAID: 'text-blue-400',
  FAILED: 'text-red-400',
  SHIPPED: 'text-purple-400',
  DELIVERED: 'text-green-400',
}

const COURIERS = [
  'Pos Laju',
  'J&T Express',
  'DHL',
  'GDEX',
  'City-Link',
  'Ninja Van',
  'Shopee Express',
  'Lazada Express',
]

function ShipModal({ order, onClose, onShipped }: { order: Order; onClose: () => void; onShipped: () => void }) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('Pos Laju')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/orders/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, trackingNumber, courierName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to ship'); return }
      onShipped()
      onClose()
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded border border-yellow-800 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-md rounded-lg border border-yellow-800 p-6" style={{ backgroundColor: '#111' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>Ship Order #{order.id.slice(0, 8)}…</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Courier</label>
            <select value={courierName} onChange={e => setCourierName(e.target.value)} className={inputCls}>
              {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Tracking Number</label>
            <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
              required placeholder="e.g. EP123456789MY" className={inputCls} />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="rounded px-6 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--gold)', color: '#0A0A0A' }}>
              {loading ? 'Shipping…' : 'Mark as Shipped'}
            </button>
            <button type="button" onClick={onClose}
              className="rounded border border-yellow-800 px-6 py-2 text-sm text-gray-300 hover:bg-yellow-900/20">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading, mutate } = useSWR<Order[]>('/api/orders', fetcher)
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Orders</h1>

      {isLoading && <p className="text-gray-400">Loading…</p>}

      {!isLoading && (
        <div className="overflow-x-auto rounded border border-yellow-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-800 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-500">No orders yet.</td></tr>
              )}
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-yellow-900 hover:bg-yellow-950/20">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs">{order.user.name}</p>
                    <p className="text-gray-500 text-xs">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--gold)' }}>
                    RM {Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${statusColor[order.status] ?? 'text-gray-400'}`}>
                    {order.status}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                    {order.trackingNumber ? (
                      <div>
                        <p>{order.trackingNumber}</p>
                        <p className="text-gray-600">{order.courierName}</p>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-MY')}
                  </td>
                  <td className="px-4 py-3">
                    {order.status === 'PAID' && (
                      <button onClick={() => setShippingOrder(order)}
                        className="rounded px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--gold)', color: '#0A0A0A' }}>
                        Ship
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button onClick={async () => {
                        await fetch('/api/orders/deliver', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderId: order.id }),
                        })
                        mutate()
                      }}
                        className="rounded border border-green-700 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-900/20">
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shippingOrder && (
        <ShipModal
          order={shippingOrder}
          onClose={() => setShippingOrder(null)}
          onShipped={() => { mutate(); }}
        />
      )}
    </div>
  )
}
