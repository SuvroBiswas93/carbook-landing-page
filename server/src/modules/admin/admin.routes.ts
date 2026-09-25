import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { adminLimiter } from '../../middlewares/rateLimiter'
import { createAdminService } from './admin.service'

export function createAdminRouter(repos: Repos): Router {
  const service = createAdminService(repos)
  const router = Router()

  // Invalidate server cache on writes so snapshot is fresh after mutations
  // We hook into write operations via a simple middleware that clears cache on mutating methods
  // For now, admin snapshot is called after mutations, so TTL is enough, but we also expose invalidate
  // and clear on every admin write by listening? Simplest: clear cache on each snapshot fetch that is > TTL,
  // and also provide a way to clear. We'll also clear cache when this endpoint is called with ?refresh=1
  // but more robust: the service is recreated per app instance, so we can just rely on TTL.
  // To ensure instant after writes, we clear cache when any write occurs via monkey patch: wrap repos?
  // For simplicity, just always fetch fresh and cache for 2s - writes will be seen within 2s max.
  // We keep it simple.

  router.get(
    '/data',
    requireAuth,
    adminLimiter,
    asyncHandler(async (_req, res) => {
      const data = await service.getSnapshot()
      // Allow client to cache for 5 seconds, stale-while-revalidate for 30s
      // For admin data we want fresh but still allow SWR
      res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=30')
      // Also set ETag-like header via timestamp
      res.setHeader('X-Admin-Snapshot-Cached', 'true')
      res.json(data)
    })
  )

  // Separate endpoint to invalidate cache if needed
  router.post(
    '/data/invalidate',
    requireAuth,
    asyncHandler(async (_req, res) => {
      service.invalidate()
      res.json({ ok: true })
    })
  )

  return router
}
