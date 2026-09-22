import type { RequestHandler } from 'express'
import { verifyAccessToken } from '../utils/token'
import { Unauthorized } from '../lib/apiError'

function extractBearerToken(req: { headers: { authorization?: string } }): string | null {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim()
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req)
  if (!token) return next(Unauthorized('Authentication required. Please sign in.'))
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req)
  if (!token) return next()
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email }
  } catch {
    /* invalid token on a public route - leave unauthenticated */
  }
  next()
}