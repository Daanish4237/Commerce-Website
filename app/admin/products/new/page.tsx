'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Category { id: string; name: string }

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
  const [materialCare, setMaterialCare] = useState('')
  const [colours, setColours] = useState('')
  const [sizes, setSizes] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [videoError, setVideoError] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? d)).catch(() => setError('Failed to load categories.'))
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVideoError('')
    const file = e.target.files?.[0] ?? null
    if (!file) { setVideo(null); setVideoPreview(''); return }
    // Validate duration client-side
    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.src = url
    vid.onloadedmetadata = () => {
      if (vid.duration > 60) {
        setVideoError('Video must be less than 1 minute long.')
        setVideo(null)
        setVideoPreview('')
      } else {
        setVideo(file)
        setVideoPreview(url)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (images.length < 3) { setError('Please select at least 3 images.'); return }
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
      fd.append('materialCare', materialCare)
      fd.append('colours', colours)
      fd.append('sizes', sizes)
      images.forEach((img, i) => fd.append(`images[${i}]`, img))
      if (video) fd.append('video', video)

      const res = await fetch('/api/products/add', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.details?.join(', ') ?? data.error ?? 'Failed to add product.'); return }
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
        <Field label="SKU"><input value={sku} onChange={e => setSku(e.target.value)} required placeholder="e.g. RNG-001" className={inputCls} /></Field>
        <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} required placeholder="Product name" className={inputCls} /></Field>
        <Field label="Category">
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className={inputCls}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Type"><input value={type} onChange={e => setType(e.target.value)} required placeholder="e.g. Gold, American Diamond" className={inputCls} /></Field>
        <Field label="Price (RM)"><input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="0.00" className={inputCls} /></Field>
        <Field label="Stock"><input type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} required className={inputCls} /></Field>
        <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Product description" className={inputCls} /></Field>
        <Field label="Material Care">
          <textarea value={materialCare} onChange={e => setMaterialCare(e.target.value)} rows={3}
            placeholder="e.g. Avoid contact with water. Store in a dry place. Clean with a soft cloth."
            className={inputCls} />
        </Field>
        <Field label="Colours (comma-separated)"><input value={colours} onChange={e => setColours(e.target.value)} placeholder="e.g. Gold,Silver,Rose Gold" className={inputCls} /></Field>
        <Field label="Sizes (comma-separated)"><input value={sizes} onChange={e => setSizes(e.target.value)} placeholder="e.g. 6,7,8,9,10" className={inputCls} /></Field>
        <Field label="Images (minimum 3 required)">
          <input type="file" accept="image/*" multiple required onChange={handleImageChange}
            className="text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium" />
          {images.length > 0 && (
            <p className={`text-xs mt-1 ${images.length < 3 ? 'text-red-400' : 'text-green-400'}`}>
              {images.length} image{images.length !== 1 ? 's' : ''} selected {images.length < 3 ? `(need ${3 - images.length} more)` : '✓'}
            </p>
          )}
          {previews.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden border border-yellow-800 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = images.filter((_, idx) => idx !== i)
                      const newPreviews = previews.filter((_, idx) => idx !== i)
                      setImages(newImages)
                      setPreviews(newPreviews)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(220,38,38,0.9)', color: 'white' }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-black/60 text-gray-300 py-0.5">{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Product Video (optional, max 60 seconds)">
          <input type="file" accept="video/*" onChange={handleVideoChange}
            className="text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium" />
          {videoError && <p className="text-xs text-red-400 mt-1">{videoError}</p>}
          {videoPreview && (
            <video src={videoPreview} controls className="mt-2 w-full rounded border border-yellow-800" style={{ maxHeight: '200px' }} />
          )}
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
