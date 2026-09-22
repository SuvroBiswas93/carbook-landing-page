import rateLimit from 'express-rate-limit'
import type { RateLimitRequestHandler } from 'express-rate-limit'
import type { Request, Response } from 'express'
import { env } from '../config/env'

export type RateLimitKeyGenerator = (req: Request) => string

interface LimiterOptions {
  windowMs: number
  limit: number
  keyGenerator?: RateLimitKeyGenerator
}

export function createLimiter(options: LimiterOptions): RateLimitRequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: options.keyGenerator,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ error: 'Too many requests. Please try again later.' })
    },
  })
}

export const globalLimiter = createLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_GLOBAL_LIMIT,
})

export const healthLimiter = createLimiter({ windowMs: 60_000, limit: 60 })

export const authLimiter = createLimiter({ windowMs: 60_000, limit: 30 })

export const loginLimiter = createLimiter({
  windowMs: env.LOGIN_WINDOW_MS,
  limit: env.LOGIN_LIMIT,
})

export const refreshLimiter = createLimiter({ windowMs: 15 * 60_000, limit: 30 })

export const adminLimiter = createLimiter({ windowMs: 60_000, limit: 120 })

export const adminWriteLimiter = createLimiter({ windowMs: 60_000, limit: 60 })

export const publicBookingLimiter = createLimiter({ windowMs: 10 * 60_000, limit: 10 })

export const publicReviewLimiter = createLimiter({ windowMs: 10 * 60_000, limit: 5 })