import { Router } from 'express'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { adminWriteLimiter } from '../../middlewares/rateLimiter'
import { createUploadsService } from './uploads.service'
import { keySchema, presignSchema } from './uploads.validation'

export function createUploadsRouter(): Router {
  const service = createUploadsService()
  const router = Router()

  router.post(
    '/presign',
    requireAuth,
    adminWriteLimiter,
    validate(presignSchema),
    asyncHandler(async (req, res) => {
      res.json(
        await service.presign(req.body as { fileName: string; contentType: string; size: number })
      )
    })
  )

  router.delete(
    '/:key',
    requireAuth,
    adminWriteLimiter,
    validate(keySchema, 'params'),
    asyncHandler(async (req, res) => {
      res.json(await service.remove(req.params.key))
    })
  )

  return router
}