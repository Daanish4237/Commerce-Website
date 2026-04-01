'use client'

import { useState } from 'react'

interface ReviewFormProps {
  productId: string
  onSubmitted?: () => void
}

export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: Number(rating), comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to submit review.')
      } else {
        setSuccess(true)
        setComment('')
        setRating('5')
        onSubmitted?.()
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-green-400">
        Your review has been submitted. Thank you!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>
        Leave a Review
      </h3>

      <div className="flex flex-col gap-1">
        <label htmlFor="rating" className="text-sm text-gray-300">
          Rating
        </label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-32 rounded border border-yellow-700 bg-transparent px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-600"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'star' : 'stars'}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="comment" className="text-sm text-gray-300">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          placeholder="Share your experience..."
          className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
          style={{ backgroundColor: '#1a1a1a' }}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
