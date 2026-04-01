'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  sku: string
  name: string
  type: string
  price: number
  stock: number
  category: { name: string }
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products?page=1')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProducts(data.products)
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try {
      const res = await fetch('/api/products/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete product.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>Products</h1>
        <Link href="/admin/products/new"
          className="rounded px-4 py-2 text-sm font-semibold"
          style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
          + Add Product
        </Link>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-yellow-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-800 text-left text-xs uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No products found.</td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id} className="border-b border-yellow-900 hover:bg-yellow-950/20">
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{p.sku}</td>
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3 text-gray-300">{p.category?.name}</td>
                  <td className="px-4 py-3 text-gray-300">{p.type}</td>
                  <td className="px-4 py-3 text-gray-300">RM {Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                        className="rounded px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="rounded border border-red-700 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-900/30 disabled:opacity-50">
                        {deleting === p.id ? '…' : 'Delete'}
                      </button>
                    </div>
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
