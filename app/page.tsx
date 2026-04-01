'use client'

import Link from 'next/link'
import useSWR from 'swr'
import ProductGrid from '@/components/ProductGrid'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  price: number | string
  stock: number
  imageUrl: string
  category: { name: string }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const { data: newArrivals, isLoading } = useSWR<Product[]>('/api/products/new-arrivals', fetcher)

  return (
    <main style={{ color: 'white' }}>
      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center"
        style={{ backgroundColor: '#111' }}
      >
        <h1 className="text-4xl font-bold tracking-widest md:text-6xl" style={{ color: 'var(--gold)' }}>
          SOHO JEWELS
        </h1>
        <p className="max-w-xl text-lg text-gray-300">
          Timeless luxury. Crafted for those who appreciate the finest.
        </p>
        <Link
          href="/products"
          className="mt-2 rounded border border-yellow-600 px-8 py-3 text-sm font-semibold tracking-widest transition-colors hover:bg-yellow-600 hover:text-black"
          style={{ color: 'var(--gold)' }}
        >
          SHOP NOW
        </Link>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-8 text-2xl font-bold tracking-wide" style={{ color: 'var(--gold)' }}>
          New Arrivals
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-yellow-900 overflow-hidden"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <div className="aspect-square w-full bg-gray-800" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-3 w-1/3 rounded bg-gray-700" />
                  <div className="h-4 w-3/4 rounded bg-gray-700" />
                  <div className="h-8 w-full rounded bg-gray-700 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={newArrivals ?? []} />
        )}
      </section>
    </main>
  )
}
