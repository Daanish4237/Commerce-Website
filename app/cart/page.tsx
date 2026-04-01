'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'

export const dynamic = 'force-dynamic'

interface CartItem {
  id: string
  quantity: number
  product: { id: string; name: string; price: number | string; imageUrl: string; stock: number }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CartPage() {
  const router = useRouter()
  const { data: items, mutate, isLoading } = useSWR<CartItem[]>('/api/cart', fetcher)
  const [checkingOut, setCheckingOut] = useState(false)

  const subtotal = (items ?? []).reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  async function updateQty(productId: string, quantity: number) {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })
    mutate()
  }

  async function removeItem(productId: string) {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    mutate()
  }

  async function handleCheckout() {
    router.push('/checkout')
  }

  if (isLoading) return <main className="mx-auto max-w-3xl px-6 py-10 text-gray-400">Loading cart…</main>

  if (!items || items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 text-center" style={{ color: 'white' }}>
        <p className="text-gray-400">Your cart is empty.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10" style={{ color: 'white' }}>
      <h1 className="mb-8 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-lg border border-yellow-800 p-4" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
              <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-semibold">{item.product.name}</p>
              <p className="text-sm" style={{ color: 'var(--gold)' }}>RM {Number(item.product.price).toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => updateQty(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}
                  className="h-6 w-6 rounded border border-yellow-700 text-sm disabled:opacity-40" style={{ color: 'var(--gold)' }}>−</button>
                <span className="text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  className="h-6 w-6 rounded border border-yellow-700 text-sm" style={{ color: 'var(--gold)' }}>+</button>
                <button onClick={() => removeItem(item.product.id)} className="ml-4 text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
            </div>
            <p className="text-sm font-bold self-center" style={{ color: 'var(--gold)' }}>
              RM {(Number(item.product.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-yellow-800 pt-6">
        <p className="text-lg font-bold">Subtotal: <span style={{ color: 'var(--gold)' }}>RM {subtotal.toFixed(2)}</span></p>
        <button onClick={handleCheckout} disabled={checkingOut}
          className="rounded px-8 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
          {checkingOut ? 'Processing…' : 'Checkout'}
        </button>
      </div>
    </main>
  )
}
