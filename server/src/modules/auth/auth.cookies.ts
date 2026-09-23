import type { Request, Response } from 'express'
import { env } from '../../config/env'
import { ttlToSeconds } from '../../utils/token'

const REFRESH_COOKIE = 'refresh_token'

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  path: '/',
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: ttlToSeconds(env.REFRESH_TOKEN_TTL) * 1000,
  })
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions)
}

export function readRefreshToken(req: Request): string | null {
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE]
  const fromBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken
  return fromCookie ?? fromBody ?? null
}