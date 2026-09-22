import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth, optionalAuth } from '../../middlewares/auth'
import { adminWriteLimiter } from '../../middlewares/rateLimiter'
import { Unauthorized } from '../../lib/apiError'
import { createCarsService } from './cars.service'

export function createCarsRouter(repos: Repos): Router {
  const service = createCarsService(repos)
  const router = Router()

  router.get(
    '/',
    optionalAuth,
    asyncHandler(async (req, res) => {
      const includeUnpublished = req.query.admin === '1'
      if (includeUnpublished && !req.user) {
        throw Unauthorized('Authentication required to view unpublished cars.')
      }
      res.json(await service.list(includeUnpublished))
    })
  )

  router.post(
    '/',
    requireAuth,
    adminWriteLimiter,
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