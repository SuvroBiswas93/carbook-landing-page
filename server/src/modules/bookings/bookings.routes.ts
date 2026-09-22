import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { adminLimiter, adminWriteLimiter, publicBookingLimiter } from '../../middlewares/rateLimiter'
import { validate } from '../../middlewares/validate'
import { createBookingsService } from './bookings.service'
import { createBookingSchema } from './bookings.validation'

export function createBookingsRouter(repos: Repos): Router {
  const service = createBookingsService(repos)
  const router = Router()

  router.get(
    '/',
    requireAuth,
    adminLimiter,
    asyncHandler(async (_req, res) => {
      res.json(await service.list())
    })
  )

  router.post(
    '/',
    publicBookingLimiter,
    validate(createBookingSchema),
    asyncHandler(async (req, res) => {
      res.status(201).json(await service.create(req.body))
    })
  )

  router.patch(
    '/:id',
    requireAuth,
    adminWriteLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.updateStatus(req.params.id, req.body))
    })
  )

  router.delete(
    '/:id',
    requireAuth,
    adminWriteLimiter,
    asyncHandler(async (req, res) => {
      res.json(await service.remove(req.params.id))
    })
  )

  return router
}