'use client'

import useSWR from 'swr'

export const dynamic = 'force-dynamic'

interface OrderItem { id: string; quantity: number; price: number | string; product: { name: string } }
interface Order {
  id: string
  status: string
  totalPrice: number | string
  createdAt: string
  user: { name: string; email: string }
  items: OrderItem[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColor: Record<string, string> = {
  PENDING: 'text-yellow-400',
  PAID: 'text-green-400',
  FAILED: 'text-red-400',
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useSWR<Order[]>('/api/orders', fetcher)

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
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No orders yet.</td></tr>
              )}
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-yellow-900 hover:bg-yellow-950/20">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs">{order.user.name}</p>
                    <p className="text-gray-500 text-xs">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--gold)' }}>
                    RM {Number(order.totalPrice).toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${statusColor[order.status] ?? 'text-gray-400'}`}>
                    {order.status}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-MY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
