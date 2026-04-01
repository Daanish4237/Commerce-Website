'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number | string
  stock: number
  imageUrl: string
  category: { name: string }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const inStock = product.stock > 0

  async function handleAddToCart() {
    if (!session) { router.push('/auth/login'); return }
    setLoading(true)
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  async function handleWishlist() {
    if (!session) { router.push('/auth/login'); return }
    const method = wishlisted ? 'DELETE' : 'POST'
    await fetch('/api/wishlist', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    })
    setWishlisted(!wishlisted)
  }

  return (
    <div
      className="flex flex-col rounded-lg border border-yellow-800 overflow-hidden hover:border-yellow-500 transition-colors"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Product image with wishlist button */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square w-full">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            {product.category.name}
          </span>
          {/* Wishlist heart button */}
          <button
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
            className="text-lg leading-none transition-transform hover:scale-110 active:scale-95 flex-shrink-0"
            style={{ color: wishlisted ? '#e05c5c' : '#555' }}
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="text-sm font-semibold text-white hover:text-yellow-400 transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        <p className="text-base font-bold" style={{ color: 'var(--gold)' }}>
          RM {Number(product.price).toFixed(2)}
        </p>

        <span
          className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${
            inStock ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}
        >
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          className="mt-auto w-full rounded py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={inStock ? { backgroundColor: 'var(--gold)', color: '#0D0D0D' } : { backgroundColor: '#333', color: '#666' }}
        >
          {loading ? 'Adding…' : added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
