'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from '@/components/ReviewForm'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { name: string }
}

interface Product {
  id: string
  sku: string
  name: string
  price: number | string
  type: string
  stock: number
  description: string
  imageUrl: string
  category: { name: string }
  reviews: Review[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const [cartLoading, setCartLoading] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)

  const { data: product, isLoading, mutate } = useSWR<Product>(
    id ? `/api/products/${id}` : null,
    fetcher
  )

  const inStock = (product?.stock ?? 0) > 0

  async function handleAddToCart() {
    if (!session) {
      router.push('/auth/login')
      return
    }
    setCartLoading(true)
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id }),
      })
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    } finally {
      setCartLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="animate-pulse flex flex-col gap-8 md:flex-row">
          <div className="aspect-square w-full max-w-sm rounded-lg bg-gray-800" />
          <div className="flex flex-1 flex-col gap-4">
            <div className="h-6 w-2/3 rounded bg-gray-700" />
            <div className="h-4 w-1/3 rounded bg-gray-700" />
            <div className="h-8 w-1/4 rounded bg-gray-700" />
            <div className="h-20 w-full rounded bg-gray-700" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-center">
        <p className="text-gray-400">Product not found.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10" style={{ color: 'white' }}>
      {/* Product section */}
      <div className="flex flex-col gap-10 md:flex-row">
        {/* Image */}
        <div className="relative aspect-square w-full max-w-sm flex-shrink-0 overflow-hidden rounded-lg border border-yellow-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            {product.category.name}
          </p>

          <h1 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
            {product.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span>
              <span className="text-gray-500">SKU:</span> {product.sku}
            </span>
            <span>
              <span className="text-gray-500">Type:</span> {product.type}
            </span>
          </div>

          <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
            RM {Number(product.price).toFixed(2)}
          </p>

          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-medium ${
              inStock ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>

          <p className="text-sm leading-relaxed text-gray-300">{product.description}</p>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading}
            className="mt-2 w-full max-w-xs rounded py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={
              inStock
                ? { backgroundColor: 'var(--gold)', color: '#0D0D0D' }
                : { backgroundColor: '#333', color: '#666' }
            }
          >
            {cartLoading ? 'Adding…' : cartAdded ? 'Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-14">
        <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--gold)' }}>
          Customer Reviews
        </h2>

        {product.reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {session && (
          <div className="mt-10 rounded-lg border border-yellow-800 p-6" style={{ backgroundColor: '#111' }}>
            <ReviewForm productId={product.id} onSubmitted={() => mutate()} />
          </div>
        )}
      </section>
    </main>
  )
}
