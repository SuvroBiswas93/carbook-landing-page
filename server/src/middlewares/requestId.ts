import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'

export const requestId: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string | undefined) || randomUUID()
  res.setHeader('X-Request-Id', id)
  res.locals.requestId = id
  next()
}