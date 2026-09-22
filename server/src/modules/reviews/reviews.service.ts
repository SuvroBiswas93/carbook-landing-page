import type { Repos } from '../../repos'
import { isRecord } from '../../lib/isRecord'
import { BadRequest, NotFound } from '../../lib/apiError'
import type { Review } from '../../domain'

export function createReviewsService(repos: Repos) {
  function reviewFromBody(body: unknown): Omit<Review, 'id' | 'createdAt'> {
    if (!isRecord(body)) throw BadRequest('Invalid request payload.')
    const requestedRating = Number(body.rating ?? 5)
    return {
      name: String(body.name ?? '').trim(),
      rating: Number.isFinite(requestedRating)
        ? Math.min(5, Math.max(1, requestedRating))
        : 5,
      text: String(body.text ?? '').trim(),
      location: String(body.location ?? '').trim(),
      hidden: true,
    }
  }

  function validateRequired(review: Pick<Review, 'name' | 'location' | 'text'>): void {
    if (!review.name || !review.location || !review.text) {
      throw BadRequest('Name, location, and review text are required.')
    }
  }

  return {
    async list(includeHidden: boolean) {
      return repos.reviews.list(includeHidden)
    },

    async create(body: unknown) {
      const review = reviewFromBody(body)
      validateRequired(review)
      const created = await repos.reviews.create({
        ...review,
        createdAt: new Date().toISOString(),
      })
      return created
    },

    async update(id: number, body: unknown) {
      if (!isRecord(body)) throw BadRequest('Invalid request payload.')
      const updated = await repos.reviews.update(id, body)
      if (!updated) throw NotFound('Review not found.')
      validateRequired(updated)
      return updated
    },

    async remove(id: number) {
      const removed = await repos.reviews.remove(id)
      if (!removed) throw NotFound('Review not found.')
      return { ok: true }
    },
  }
}

export type ReviewsService = ReturnType<typeof createReviewsService>