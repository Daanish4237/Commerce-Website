interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { name: string }
}

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < review.rating ? '★' : '☆')
  const date = new Date(review.createdAt).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className="rounded-lg border border-yellow-800 p-4 flex flex-col gap-2"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">{review.user.name}</span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
      <div className="text-yellow-400 tracking-widest text-sm">{stars.join('')}</div>
      <p className="text-sm text-gray-300">{review.comment}</p>
    </div>
  )
}
