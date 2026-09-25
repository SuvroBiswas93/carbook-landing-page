import type { Repos } from '../../repos'

export function createAdminService(repos: Repos) {
  // Simple in-memory cache to make repeated admin data fetches instant
  let cache: { data: { bookings: unknown; cars: unknown; reviews: unknown }; timestamp: number } | null = null
  const CACHE_TTL_MS = 2000 // 2 seconds server-side cache

  return {
    async getSnapshot() {
      const now = Date.now()
      if (cache && now - cache.timestamp < CACHE_TTL_MS) {
        return cache.data
      }

      const [bookings, cars, reviews] = await Promise.all([
        repos.bookings.list(),
        repos.cars.list(true),
        repos.reviews.list(true),
      ])

      // Sort reviews newest first (mirror reviews service logic)
      const sortedReviews = [...(reviews as any[])].sort((a: any, b: any) => {
        const timeA = Date.parse(a.createdAt) || a.id
        const timeB = Date.parse(b.createdAt) || b.id
        if (timeB !== timeA) return timeB - timeA
        return b.id - a.id
      })

      // Bookings are already reversed (newest first) in repo, but ensure
      const data = {
        bookings,
        cars,
        reviews: sortedReviews,
      }

      cache = { data, timestamp: now }
      return data
    },
    invalidate() {
      cache = null
    },
  }
}

export type AdminService = ReturnType<typeof createAdminService>
