'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'

interface WishlistItem {
  id: string
  product: { id: string; name: string; price: number | string; imageUrl: string; category: { name: string } }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WishlistPage() {
  const { data: items, mutate, isLoading } = useSWR<WishlistItem[]>('/api/wishlist', fetcher)

  async function removeItem(productId: string) {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    mutate()
  }

  if (isLoading) return <main className="mx-auto max-w-5xl px-6 py-10 text-gray-400">Loading wishlist…</main>

  if (!items || items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-center" style={{ color: 'white' }}>
        <p className="text-gray-400">Your wishlist is empty.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10" style={{ color: 'white' }}>
      <h1 className="mb-8 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Your Wishlist</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col rounded-lg border border-yellow-800 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
            <Link href={`/products/${item.product.id}`} className="relative block aspect-square w-full">
              <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
            </Link>
            <div className="flex flex-col gap-2 p-4">
              <span className="text-xs text-gray-400">{item.product.category.name}</span>
              <Link href={`/products/${item.product.id}`} className="text-sm font-semibold text-white hover:text-yellow-400">{item.product.name}</Link>
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>RM {Number(item.product.price).toFixed(2)}</p>
              <button onClick={() => removeItem(item.product.id)} className="mt-1 text-xs text-red-400 hover:text-red-300 self-start">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
