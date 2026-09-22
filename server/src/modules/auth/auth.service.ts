import bcrypt from 'bcryptjs'
import type { Repos } from '../../repos'
import type { AdminUser, Session } from '../../domain'
import { env } from '../../config/env'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  sha256,
  newId,
  ttlToSeconds,
} from '../../utils/token'
import { TooManyRequests, Unauthorized } from '../../lib/apiError'
import { isLockedOut, registerFailure, resetAttempts } from './auth.lockout'

export interface AuthResult {
  admin: { id: string; email: string }
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
}

interface SessionForIssuing {
  id: string
  adminId: string
  tokenHash: string
  createdAt: string
  expiresAt: number
  lastUsedAt: string
}

export function createAuthService(repos: Repos) {
  const now = () => new Date().toISOString()
  const nowMs = () => Date.now()
  const accessExpiresIn = () => ttlToSeconds(env.ACCESS_TOKEN_TTL)
  const refreshLifetimeMs = () => ttlToSeconds(env.REFRESH_TOKEN_TTL) * 1000

  async function issueSession(admin: AdminUser): Promise<AuthResult> {
    const sessionId = newId('sess')
    const refreshToken = signRefreshToken(sessionId, admin.id)
    const session: SessionForIssuing = {
      id: sessionId,
      adminId: admin.id,
      tokenHash: sha256(refreshToken),
      createdAt: now(),
      expiresAt: nowMs() + refreshLifetimeMs(),
      lastUsedAt: now(),
    }
    await repos.sessions.create(session)
    return {
      admin: { id: admin.id, email: admin.email },
      accessToken: signAccessToken(admin.id, admin.email),
      refreshToken,
      accessExpiresIn: accessExpiresIn(),
    }
  }

  async function login(email: string, password: string, ip: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const key = `${ip}:${normalizedEmail}`

    if (isLockedOut(key)) {
      throw TooManyRequests(
        'Too many failed attempts. Please wait a while before trying again.'
      )
    }

    const admin = await repos.admins.getByEmail(normalizedEmail)
    const passwordOk = admin ? await bcrypt.compare(password, admin.passwordHash) : false

    if (!admin || !passwordOk) {
      registerFailure(key)
      throw Unauthorized('Invalid email or password.')
    }

    resetAttempts(key)
    return issueSession(admin)
  }

  async function refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken)
    const session = await repos.sessions.getById(payload.sid)

    if (!session || session.revokedAt || session.expiresAt < nowMs()) {
      throw Unauthorized('Session no longer exists or has expired. Please sign in again.')
    }

    if (session.tokenHash !== sha256(refreshToken)) {
      await repos.sessions.revokeAllForAdmin(payload.adminId)
      throw Unauthorized(
        'Refresh token reuse detected. All sessions for this account have been revoked. Please sign in again.'
      )
    }

    const admin = await repos.admins.getById(payload.adminId)
    if (!admin) {
      await repos.sessions.revoke(payload.sid)
      throw Unauthorized('Account no longer exists.')
    }

    await repos.sessions.revoke(payload.sid)
    await repos.sessions.prune()

    return issueSession(admin)
  }

  async function logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return
    try {
      const payload = verifyRefreshToken(refreshToken)
      await repos.sessions.revoke(payload.sid)
    } catch {
      /* token already invalid - logout is idempotent */
    }
  }

  async function me(adminId: string) {
    const admin = await repos.admins.getById(adminId)
    if (!admin) throw Unauthorized('Account no longer exists.')
    return { id: admin.id, email: admin.email, role: admin.role }
  }

  return { login, refresh, logout, me }
}

export type AuthService = ReturnType<typeof createAuthService>

export type { Session }