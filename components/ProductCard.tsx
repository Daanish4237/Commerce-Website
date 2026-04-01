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
      className="flex flex-col rounded-none border border-yellow-900/40 overflow-hidden group transition-all duration-300 hover:border-yellow-600/70 hover:shadow-xl"
      style={{ backgroundColor: '#0f0f0f', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      {/* Product image with wishlist button */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1 border-t border-yellow-900/30">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.15em] text-gray-500">
            {product.category.name}
          </span>
          {/* Wishlist heart button */}
          <button
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
            className="text-base leading-none transition-all hover:scale-125 active:scale-95 flex-shrink-0"
            style={{ color: wishlisted ? '#e05c5c' : '#444' }}
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="text-sm font-medium text-gray-100 hover:text-yellow-400 transition-colors line-clamp-2 tracking-wide"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem' }}
        >
          {product.name}
        </Link>

        <p className="text-sm font-semibold tracking-wider" style={{ color: 'var(--gold)' }}>
          RM {Number(product.price).toFixed(2)}
        </p>

        <span
          className={`self-start px-2 py-0.5 text-xs tracking-wider ${
            inStock ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {inStock ? '● In Stock' : '● Out of Stock'}
        </span>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || loading}
          className="mt-auto w-full py-2.5 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110 active:scale-95"
          style={inStock ? { backgroundColor: 'var(--gold)', color: '#0A0A0A' } : { backgroundColor: '#1a1a1a', color: '#444', border: '1px solid #333' }}
        >
          {loading ? 'Adding…' : added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
