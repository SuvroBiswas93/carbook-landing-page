import type { Express, NextFunction, Request, Response } from 'express'
import express from 'express'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import { env } from '../config/env'

const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean)
const allowAll = allowedOrigins.length === 0 || allowedOrigins.includes('*')

function isOriginAllowed(origin: string | undefined): boolean {
  if (allowAll) return true
  if (!origin) return true
  if (origin === 'null') return false
  return allowedOrigins.includes(origin)
}

export function applySecurity(app: Express): void {
  if (env.trustProxy) app.set('trust proxy', env.trustProxy)
  app.disable('x-powered-by')

  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true)
        }
        return callback(null, false)
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id', 'ETag'],
      maxAge: 86400,
    })
  )

  app.use(compression())
  app.use(cookieParser())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
}

export function enforceAllowedOrigin(req: Request, res: Response, next: NextFunction): void {
  if (isOriginAllowed(req.headers.origin)) {
    next()
    return
  }
  res.status(403).json({ error: 'Origin not allowed.' })
}

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now()
  res.on('finish', () => {
    const { requestId } = res.locals
    const line =
      `${req.method} ${req.originalUrl} ${res.statusCode} ` +
      `${Date.now() - startedAt}ms reqId=${requestId ?? '-'}`
    if (res.statusCode >= 500) console.error(line)
    else console.log(line)
  })
  next()
}