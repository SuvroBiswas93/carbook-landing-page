import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth, optionalAuth } from '../../middlewares/auth'
import { adminWriteLimiter, publicReviewLimiter } from '../../middlewares/rateLimiter'
import { Unauthorized } from '../../lib/apiError'
import { createReviewsService } from './reviews.service'

export function createReviewsRouter(repos: Repos): Router {
  const service = createReviewsService(repos)
  const router = Router()

  router.get(
    '/',
    optionalAuth,
    asyncHandler(async (req, res) => {
      const includeHidden = req.query.admin === '1'
      if (includeHidden && !req.user) {
        throw Unauthorized('Authentication required to view hidden reviews.')
      }
      res.json(await service.list(includeHidden))
    })
  )

  router.post(
    '/',
    publicReviewLimiter,
    asyncHandler(async (req, res) => {
      res.status(201).json(await service.create(req.body))
    })
  )

  router.put(
    '/:id',
    requireAuth,
    adminWriteLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.update(Number(req.params.id), req.body))
    })
  )

  router.delete(
    '/:id',
    requireAuth,
    adminWriteLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.remove(Number(req.params.id)))
    })
  )

  return router
}