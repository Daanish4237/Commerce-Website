'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? data))
      .catch(() => setError('Failed to load categories.'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!image) { setError('Please select an image.'); return }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('sku', sku)
      fd.append('name', name)
      fd.append('categoryId', categoryId)
      fd.append('type', type)
      fd.append('price', price)
      fd.append('stock', stock)
      fd.append('description', description)
      fd.append('image', image)

      const res = await fetch('/api/products/add', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.details?.join(', ') ?? data.error ?? 'Failed to add product.')
        return
      }
      router.push('/admin/products')
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Add Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="SKU">
          <input value={sku} onChange={(e) => setSku(e.target.value)} required placeholder="e.g. RNG-001" className={inputCls} />
        </Field>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product name" className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputCls}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <input value={type} onChange={(e) => setType(e.target.value)} required placeholder="e.g. Gold, American Diamond" className={inputCls} />
        </Field>
        <Field label="Price (RM)">
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Stock">
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} placeholder="Product description" className={inputCls} />
        </Field>
        <Field label="Image">
          <input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium"
            style={{ '--file-bg': 'var(--gold)' } as React.CSSProperties} />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="rounded px-5 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
            {loading ? 'Saving…' : 'Add Product'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded border border-yellow-700 px-5 py-2 text-sm text-gray-300 hover:bg-yellow-900/20">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'w-full rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  )
}
