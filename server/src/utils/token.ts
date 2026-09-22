import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { env } from '../config/env'
import { Unauthorized } from '../lib/apiError'

export interface AccessTokenPayload {
  sub: string
  email: string
  type: 'access'
}

export interface RefreshTokenPayload {
  sid: string
  adminId: string
  type: 'refresh'
}

export function signAccessToken(adminId: string, email: string): string {
  return jwt.sign({ type: 'access', email } as object, env.JWT_ACCESS_SECRET, {
    subject: adminId,
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'],
  })
}

export function signRefreshToken(sessionId: string, adminId: string): string {
  return jwt.sign(
    { type: 'refresh', adminId, jti: randomUUID() } as object,
    env.JWT_REFRESH_SECRET,
    { subject: sessionId, expiresIn: env.REFRESH_TOKEN_TTL as SignOptions['expiresIn'] }
  )
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload
    if (payload?.type !== 'access' || !payload.sub) throw new Error('invalid access token payload')
    return { sub: String(payload.sub), email: String(payload.email ?? ''), type: 'access' }
  } catch {
    throw Unauthorized('Invalid or expired access token.')
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload
    if (payload?.type !== 'refresh' || !payload.sub || !payload.adminId) {
      throw new Error('invalid refresh token payload')
    }
    return {
      sid: String(payload.sub),
      adminId: String(payload.adminId),
      type: 'refresh',
    }
  } catch {
    throw Unauthorized('Invalid or expired refresh token.')
  }
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`
}

export function randomSecret(bytes = 48): string {
  return randomBytes(bytes).toString('hex')
}

export function ttlToSeconds(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl.trim())
  if (!match) return 60
  const value = Number(match[1])
  const unit = match[2]
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * (multiplier[unit] ?? 1)
}