'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'
import { useSession, signOut } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Category {
  id: string
  name: string
}

interface CartData {
  items?: unknown[]
}

export default function Navbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const { data: categories } = useSWR<Category[]>('/api/categories', fetcher)
  const { data: cartData } = useSWR<CartData>(
    session ? '/api/cart' : null,
    fetcher
  )

  const [search, setSearch] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const cartCount = cartData?.items?.length ?? 0
  const categoryList = Array.isArray(categories) ? categories : []

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearch(value)
    if (value.trim()) {
      router.push(`/products?search=${encodeURIComponent(value.trim())}`)
    } else {
      router.push('/products')
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-yellow-700 px-6 py-3"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/Soho Jewels logo.jpeg" alt="Soho Jewels" width={120} height={60} priority unoptimized className="object-contain" />
        </Link>

        {/* Categories dropdown */}
        <div className="relative">
          <button
            onClick={() => setCatOpen((o) => !o)}
            className="flex items-center gap-1 text-sm font-medium hover:text-yellow-400"
            style={{ color: 'var(--gold)' }}
          >
            Categories
            <span className="text-xs">{catOpen ? '▲' : '▼'}</span>
          </button>
          {catOpen && (
            <div
              className="absolute left-0 top-full mt-1 min-w-[160px] rounded border border-yellow-700 py-1 shadow-lg"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <Link
                href="/products"
                className="block px-4 py-2 text-sm hover:bg-yellow-900"
                style={{ color: 'var(--gold)' }}
                onClick={() => setCatOpen(false)}
              >
                All Products
              </Link>
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="block px-4 py-2 text-sm hover:bg-yellow-900"
                  style={{ color: 'var(--gold)' }}
                  onClick={() => setCatOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search jewellery..."
          className="flex-1 max-w-xs rounded border border-yellow-700 bg-transparent px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
        />

        {/* About & Contact links */}
        <Link href="/about" className="text-sm font-medium hover:text-yellow-400 transition-colors whitespace-nowrap" style={{ color: 'var(--gold)' }}>
          About Us
        </Link>
        <Link href="/contact" className="text-sm font-medium hover:text-yellow-400 transition-colors whitespace-nowrap" style={{ color: 'var(--gold)' }}>
          Contact Us
        </Link>

        {/* Cart icon */}
        <Link href="/cart" className="relative flex items-center" style={{ color: 'var(--gold)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Account menu */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((o) => !o)}
            className="flex items-center gap-1 text-sm font-medium hover:text-yellow-400"
            style={{ color: 'var(--gold)' }}
          >
            {session?.user?.name ?? 'Account'}
            <span className="text-xs">{accountOpen ? '▲' : '▼'}</span>
          </button>
          {accountOpen && (
            <div
              className="absolute right-0 top-full mt-1 min-w-[140px] rounded border border-yellow-700 py-1 shadow-lg"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              {session ? (
                <>
                  <p className="px-4 py-2 text-xs text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                  {session.user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm hover:bg-yellow-900"
                      style={{ color: 'var(--gold)' }}
                      onClick={() => setAccountOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setAccountOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-yellow-900"
                    style={{ color: 'var(--gold)' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-sm hover:bg-yellow-900"
                    style={{ color: 'var(--gold)' }}
                    onClick={() => setAccountOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-2 text-sm hover:bg-yellow-900"
                    style={{ color: 'var(--gold)' }}
                    onClick={() => setAccountOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
