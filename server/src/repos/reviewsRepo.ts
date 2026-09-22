import { readJson, writeJson, nextNumericId } from '../lib/jsonStore'
import type { Review } from '../domain'

export interface ReviewsRepo {
  list(includeHidden?: boolean): Promise<Review[]>
  create(review: Omit<Review, 'id'>): Promise<Review>
  update(id: number, patch: Partial<Omit<Review, 'id'>>): Promise<Review | null>
  remove(id: number): Promise<boolean>
}

export function normalizeReview(raw: Partial<Review>): Review {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    rating: Math.min(5, Math.max(1, Number(raw.rating ?? 5))),
    text: String(raw.text ?? ''),
    location: String(raw.location ?? ''),
    hidden: raw.hidden ?? false,
    createdAt: String(raw.createdAt ?? ''),
  }
}

export const jsonReviewsRepo: ReviewsRepo = {
  async list(includeHidden = false) {
    const reviews = await readJson<Partial<Review>[]>('reviews.json', [])
    const normalized = reviews.map(normalizeReview)
    return includeHidden ? normalized : normalized.filter((review) => !review.hidden)
  },

  async create(review) {
    const reviews = await readJson<Partial<Review>[]>('reviews.json', [])
    const created: Review = { ...review, id: nextNumericId(reviews) }
    reviews.unshift(created)
    await writeJson('reviews.json', reviews)
    return created
  },

  async update(id, patch) {
    const reviews = await readJson<Partial<Review>[]>('reviews.json', [])
    const index = reviews.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null

    const current = normalizeReview(reviews[index])
    const requestedRating = Number(patch.rating ?? current.rating)
    const updated: Review = {
      ...current,
      name: String(patch.name ?? current.name).trim(),
      rating: Number.isFinite(requestedRating)
        ? Math.min(5, Math.max(1, requestedRating))
        : current.rating,
      text: String(patch.text ?? current.text).trim(),
      location: String(patch.location ?? current.location).trim(),
      hidden: typeof patch.hidden === 'boolean' ? patch.hidden : current.hidden,
    }

    reviews[index] = updated
    await writeJson('reviews.json', reviews)
    return updated
  },

  async remove(id) {
    const reviews = await readJson<Partial<Review>[]>('reviews.json', [])
    const next = reviews.filter((item) => Number(item.id) !== id)
    if (next.length === reviews.length) return false
    await writeJson('reviews.json', next)
    return true
  },
}