'use client'

import { useState } from 'react'
import useSWR from 'swr'

export const dynamic = 'force-dynamic'

interface Category { id: string; name: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminCategoriesPage() {
  const { data: categories, mutate, isLoading } = useSWR<Category[]>('/api/categories', fetcher)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to add category.'); return }
      setName('')
      mutate()
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    setDeleting(id)
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      mutate()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Categories</h1>

      <form onSubmit={handleAdd} className="mb-8 flex gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="New category name"
          className="flex-1 rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
        <button type="submit" disabled={adding}
          className="rounded px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {isLoading && <p className="text-gray-400">Loading…</p>}
      <div className="flex flex-col gap-2">
        {(categories ?? []).map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded border border-yellow-800 px-4 py-3" style={{ backgroundColor: '#1a1a1a' }}>
            <span className="text-sm text-white">{cat.name}</span>
            <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}
              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
              {deleting === cat.id ? '…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
