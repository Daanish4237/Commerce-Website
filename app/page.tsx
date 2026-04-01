'use client'

import Link from 'next/link'
import useSWR from 'swr'
import ProductGrid from '@/components/ProductGrid'
import OrnamentDivider from '@/components/OrnamentDivider'

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
        className="flex flex-col items-center justify-center gap-6 px-6 py-32 text-center relative overflow-hidden"
        style={{ backgroundColor: '#080808' }}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: 'var(--gold)' }} />
        </div>

        <p className="text-xs uppercase tracking-[0.4em] text-gray-500 animate-fade-in">Est. 2024</p>
        <h1 className="text-5xl font-light tracking-[0.2em] md:text-7xl animate-slide-up gold-shimmer" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          SOHO JEWELS
        </h1>
        <OrnamentDivider size="lg" animate className="animate-slide-up-delay" />
        <p className="max-w-md text-sm font-light tracking-widest text-gray-400 animate-slide-up-delay uppercase">
          Timeless luxury. Crafted for those who appreciate the finest.
        </p>
        <Link
          href="/products"
          className="mt-4 px-10 py-3 text-xs font-semibold tracking-[0.3em] uppercase transition-all duration-300 animate-slide-up-delay-2 hover:shadow-lg"
          style={{ border: '1px solid var(--gold)', color: 'var(--gold)', letterSpacing: '0.3em' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--gold)'; (e.currentTarget as HTMLElement).style.color = '#0A0A0A'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
        >
          Explore Collection
        </Link>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-2 text-3xl font-light tracking-[0.15em] uppercase" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
          New Arrivals
        </h2>
        <OrnamentDivider size="md" animate className="mb-8" />

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
          <ProductGrid products={Array.isArray(newArrivals) ? newArrivals : []} />
        )}
      </section>
    </main>
  )
}
