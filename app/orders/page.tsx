'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'

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
  items: OrderItem[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  PENDING:   { label: 'Pending Payment', color: 'text-yellow-400', step: 0 },
  PAID:      { label: 'Paid — Processing', color: 'text-blue-400', step: 1 },
  FAILED:    { label: 'Payment Failed', color: 'text-red-400', step: 0 },
  SHIPPED:   { label: 'Shipped', color: 'text-purple-400', step: 2 },
  DELIVERED: { label: 'Delivered', color: 'text-green-400', step: 3 },
}

function TrackingPanel({ orderId }: { orderId: string }) {
  const { data, isLoading } = useSWR(`/api/orders/track?orderId=${orderId}`, fetcher)

  if (isLoading) return <p className="text-xs text-gray-500 mt-2">Loading tracking info…</p>
  if (!data?.trackingNumber) return null

  return (
    <div className="mt-3 rounded border border-yellow-900/30 p-3" style={{ backgroundColor: 'rgba(201,168,76,0.04)' }}>
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Tracking</p>
      <p className="text-xs text-gray-300">Courier: <span className="text-white">{data.courierName}</span></p>
      <p className="text-xs text-gray-300 mt-1">Tracking No: <span className="font-mono text-white">{data.trackingNumber}</span></p>
      {data.shippedAt && (
        <p className="text-xs text-gray-500 mt-1">Shipped: {new Date(data.shippedAt).toLocaleDateString('en-MY')}</p>
      )}
      {data.tracking?.checkpoints?.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          {data.tracking.checkpoints.slice(0, 5).map((cp: { date: string; description: string }, i: number) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-gray-600 flex-shrink-0">{cp.date}</span>
              <span className="text-gray-300">{cp.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useSWR<Order[]>('/api/orders', fetcher)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (isLoading) return <main className="mx-auto max-w-3xl px-6 py-10 text-gray-400">Loading orders…</main>

  const myOrders = (orders ?? []).filter(o => o.status !== undefined)

  return (
    <main className="mx-auto max-w-3xl px-6 py-10" style={{ color: 'white' }}>
      <h1 className="mb-8 text-2xl font-light tracking-[0.15em]" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
        My Orders
      </h1>

      {myOrders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No orders yet.</p>
          <Link href="/products" className="text-sm" style={{ color: 'var(--gold)' }}>Start Shopping</Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {myOrders.map((order) => {
          const cfg = statusConfig[order.status] ?? { label: order.status, color: 'text-gray-400', step: 0 }
          const isOpen = expanded === order.id

          return (
            <div key={order.id} className="rounded-lg border border-yellow-900/30 overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
              {/* Order header */}
              <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-yellow-950/10 transition-colors"
                onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-mono text-gray-500">#{order.id.slice(0, 12)}…</p>
                  <p className="text-sm font-medium text-white">RM {Number(order.totalPrice).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-MY')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Order details */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-yellow-900/20">
                  {/* Status timeline */}
                  <div className="flex items-center gap-0 mt-4 mb-4">
                    {['Paid', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${cfg.step > i ? 'bg-yellow-600 text-black' : cfg.step === i ? 'border-2 border-yellow-500 text-yellow-400' : 'border border-gray-700 text-gray-600'}`}>
                          {cfg.step > i ? '✓' : i + 1}
                        </div>
                        <p className={`text-xs ml-1 ${cfg.step >= i ? 'text-gray-300' : 'text-gray-600'}`}>{step}</p>
                        {i < 3 && <div className={`flex-1 h-px mx-2 ${cfg.step > i ? 'bg-yellow-700' : 'bg-gray-800'}`} />}
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-1 mb-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-400">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>RM {(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking */}
                  {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                    <TrackingPanel orderId={order.id} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
