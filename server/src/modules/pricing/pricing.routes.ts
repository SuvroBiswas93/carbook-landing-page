import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { adminLimiter, adminWriteLimiter } from '../../middlewares/rateLimiter'
import { createPricingService } from './pricing.service'

export function createPricingRouter(repos: Repos): Router {
  const service = createPricingService(repos)
  const router = Router()

  router.get(
    '/',
    adminLimiter,
    asyncHandler(async (_req, res) => {
      res.json(await service.get())
    })
  )

  router.put(
    '/',
    requireAuth,
    adminWriteLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.update(req.body))
    })
  )

  return router
}