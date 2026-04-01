'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import ProductGrid from '@/components/ProductGrid'

interface Product {
  id: string
  name: string
  price: number | string
  stock: number
  imageUrl: string
  category: { name: string }
}

interface ProductsResponse {
  products: Product[]
  total: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function ProductsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''

  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (search) params.set('search', search)
  const query = params.toString()

  const { data, isLoading } = useSWR<ProductsResponse>(
    `/api/products${query ? `?${query}` : ''}`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-yellow-900 overflow-hidden"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div className="aspect-square w-full bg-gray-800" />
            <div className="p-4 flex flex-col gap-3">
              <div className="h-3 w-1/3 rounded bg-gray-700" />
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-4 w-1/4 rounded bg-gray-700" />
              <div className="h-8 w-full rounded bg-gray-700 mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const products = data?.products ?? []

  return (
    <>
      <p className="mb-6 text-sm text-gray-400">
        {data?.total ?? 0} product{(data?.total ?? 0) !== 1 ? 's' : ''} found
        {search && (
          <span>
            {' '}for &ldquo;<span style={{ color: 'var(--gold)' }}>{search}</span>&rdquo;
          </span>
        )}
        {category && !search && (
          <span> in selected category</span>
        )}
      </p>
      <ProductGrid products={products} />
    </>
  )
}

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10" style={{ color: 'white' }}>
      <h1
        className="mb-8 text-3xl font-bold tracking-wide"
        style={{ color: 'var(--gold)' }}
      >
        Our Collection
      </h1>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-700 border-t-yellow-400"
          />
        </div>
      }>
        <ProductsContent />
      </Suspense>
    </main>
  )
}
