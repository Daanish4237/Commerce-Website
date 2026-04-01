'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [description, setDescription] = useState('')
  const [materialCare, setMaterialCare] = useState('')
  const [colours, setColours] = useState('')
  const [sizes, setSizes] = useState('')
  const [newImage, setNewImage] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([product, catData]) => {
        setSku(product.sku ?? '')
        setName(product.name ?? '')
        setCategoryId(product.categoryId ?? '')
        setType(product.type ?? '')
        setPrice(String(product.price ?? ''))
        setStock(String(product.stock ?? 0))
        setDescription(product.description ?? '')
        setMaterialCare(product.materialCare ?? '')
        setColours(product.colours ?? '')
        setSizes(product.sizes ?? '')
        setCategories(catData.categories ?? catData)
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setFetching(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let imageBase64: string | undefined
      if (newImage) {
        const buffer = await newImage.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
        imageBase64 = btoa(binary)
      }

      const body: Record<string, unknown> = { id, sku, name, categoryId, type, price: Number(price), stock: Number(stock), description, materialCare, colours, sizes }
      if (imageBase64) body.imageBase64 = imageBase64

      const res = await fetch('/api/products/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.details?.join(', ') ?? data.error ?? 'Failed to update product.')
        return
      }
      router.push('/admin/products')
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <p className="text-gray-400">Loading…</p>

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--gold)' }}>Edit Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="SKU">
          <input value={sku} onChange={(e) => setSku(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
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
          <input value={type} onChange={(e) => setType(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Price (RM)">
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Stock">
          <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className={inputCls} />
        </Field>
        <Field label="Material Care">
          <textarea value={materialCare} onChange={(e) => setMaterialCare(e.target.value)} rows={3}
            placeholder="e.g. Avoid contact with water. Store in a dry place."
            className={inputCls} />
        </Field>
        <Field label="Colours (comma-separated)">
          <input value={colours} onChange={(e) => setColours(e.target.value)} placeholder="e.g. Gold,Silver,Rose Gold" className={inputCls} />
        </Field>
        <Field label="Sizes (comma-separated)">
          <input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="e.g. 6,7,8,9,10" className={inputCls} />
        </Field>
        <Field label="New Image (optional)">
          <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium" />
          <p className="text-xs text-gray-500">Leave blank to keep the existing image.</p>
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="rounded px-5 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
            {loading ? 'Saving…' : 'Save Changes'}
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
