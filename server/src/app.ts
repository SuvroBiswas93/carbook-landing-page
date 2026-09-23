import express from 'express'
import type { Express } from 'express'
import { applySecurity, enforceAllowedOrigin, httpLogger } from './middlewares/security'
import { requestId } from './middlewares/requestId'
import { globalLimiter, healthLimiter } from './middlewares/rateLimiter'
import { notFound } from './middlewares/notFound'
import { errorHandler } from './middlewares/errorHandler'
import { createRepos } from './repos'
import { createAuthRouter } from './modules/auth/auth.routes'
import { createUploadsRouter } from './modules/uploads/uploads.routes'
import { createCarsRouter } from './modules/cars/cars.routes'
import { createBookingsRouter } from './modules/bookings/bookings.routes'
import { createReviewsRouter } from './modules/reviews/reviews.routes'
import { createPricingRouter } from './modules/pricing/pricing.routes'

export function createApp(): Express {
  const app = express()

  applySecurity(app)
  app.use(enforceAllowedOrigin)
  app.use(requestId)
  app.use(httpLogger)

  app.set('json spaces', 2)
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    next()
  })
  app.use('/api', globalLimiter)

  const repos = createRepos()

  app.get('/api/health', healthLimiter, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ ok: true, service: 'traveling-bangladesh-api' })
  })

  app.use('/api/auth', createAuthRouter(repos))
  app.use('/api/uploads', createUploadsRouter())
  app.use('/api/cars', createCarsRouter(repos))
  app.use('/api/bookings', createBookingsRouter(repos))
  app.use('/api/reviews', createReviewsRouter(repos))
  app.use('/api/pricing', createPricingRouter(repos))

  app.use(notFound)
  app.use(errorHandler)

  return app
}