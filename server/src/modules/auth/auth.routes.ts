import { Router } from 'express'
import type { Repos } from '../../repos'
import { asyncHandler } from '../../lib/asyncHandler'
import { requireAuth } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { authLimiter, loginLimiter, refreshLimiter } from '../../middlewares/rateLimiter'
import { createAuthService } from './auth.service'
import { createAuthController } from './auth.controller'
import { loginSchema, refreshSchema } from './auth.validation'

export function createAuthRouter(repos: Repos): Router {
  const controller = createAuthController(createAuthService(repos))
  const router = Router()

  router.post(
    '/login',
    authLimiter,
    loginLimiter,
    validate(loginSchema),
    asyncHandler(controller.login)
  )

  router.post(
    '/refresh',
    refreshLimiter,
    validate(refreshSchema),
    asyncHandler(controller.refresh)
  )

  router.post('/logout', authLimiter, asyncHandler(controller.logout))

  router.get('/me', authLimiter, requireAuth, asyncHandler(controller.me))

  return router
}