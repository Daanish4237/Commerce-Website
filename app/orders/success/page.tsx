'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'

interface OrderItem {
  id: string
  quantity: number
  price: number | string
  product: { name: string }
}

interface Order {
  id: string
  status: string
  totalPrice: number | string
  createdAt: string
  items: OrderItem[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { data: orders, isLoading } = useSWR<Order[]>(orderId ? '/api/orders' : null, fetcher)
  const order = orders?.find((o) => o.id === orderId)

  if (!orderId) return <p className="text-gray-400">No order ID provided.</p>
  if (isLoading) return <p className="text-gray-400">Loading order…</p>
  if (!order) return <p className="text-gray-400">Order not found.</p>

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-5xl mb-4">✓</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>Payment Confirmed</h1>
        <p className="text-gray-400 mt-2 text-sm">Order #{order.id}</p>
      </div>

      <div className="rounded-lg border border-yellow-800 p-6" style={{ backgroundColor: '#1a1a1a' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--gold)' }}>Order Summary</h2>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-300">
              <span>{item.product.name} × {item.quantity}</span>
              <span>RM {(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-yellow-800 pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span style={{ color: 'var(--gold)' }}>RM {Number(order.totalPrice).toFixed(2)}</span>
        </div>
      </div>

      <Link href="/products" className="text-center text-sm underline" style={{ color: 'var(--gold)' }}>
        Continue Shopping
      </Link>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16" style={{ color: 'white' }}>
      <Suspense fallback={<p className="text-gray-400 text-center">Loading…</p>}>
        <OrderSuccessContent />
      </Suspense>
    </main>
  )
}
