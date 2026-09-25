import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'
import type { Review } from '@/lib/types'

interface ReviewListProps {
  reviews: Review[]
  onEdit: (review: Review) => void
  onDelete: (id: number) => void
  onToggle: (review: Review) => void
}

export function ReviewList({
  reviews,
  onEdit,
  onDelete,
  onToggle,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="p-8 text-center text-[#8c8378]">No reviews yet.</p>
    )
  }

  return (
    <ul className="divide-y divide-[#f0ebe3]">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-serif text-lg font-bold">{review.name}</h3>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-[#8c8378]">
                {review.location}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#766e64]">
              {review.text}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                review.hidden
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {review.hidden ? 'Unpublished' : 'Published'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onEdit(review)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                onClick={() => onToggle(review)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#f0ebe3] px-3 py-2 text-sm font-bold"
              >
                {review.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                {review.hidden ? 'Publish' : 'Unpublish'}
              </button>
              <button
                onClick={() => onDelete(review.id)}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
              >
                <Trash2 size={15} />
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}