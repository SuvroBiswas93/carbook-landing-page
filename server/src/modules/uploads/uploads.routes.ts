import { Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { adminWriteLimiter } from '../../middlewares/rateLimiter'
import { createUploadsService } from './uploads.service'
import { keySchema, presignSchema } from './uploads.validation'

export function createUploadsRouter(): Router {
  const service = createUploadsService()
  const router = Router()
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })

  router.post(
    '/image',
    requireAuth,
    adminWriteLimiter,
    upload.single('file'),
    asyncHandler(async (req, res) => {
      const file = req.file
      if (!file) {
        res.status(400).json({ error: 'Image file is required.' })
        return
      }
      res.json(await service.uploadImage({
        originalName: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        body: file.buffer,
      }))
    }),
  )

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