import type { Request, Response } from 'express'
import type { AuthService } from './auth.service'
import {
  clearRefreshCookie,
  readRefreshToken,
  setRefreshCookie,
} from './auth.cookies'
import { Unauthorized } from '../../lib/apiError'

interface AuthResultWin {
  admin: { id: string; email: string }
  accessToken: string
  accessExpiresIn: number
}

export function createAuthController(service: AuthService) {
  function stripRefresh(result: Awaited<ReturnType<AuthService['login']>>): AuthResultWin {
    return {
      admin: result.admin,
      accessToken: result.accessToken,
      accessExpiresIn: result.accessExpiresIn,
    }
  }

  return {
    async login(req: Request, res: Response) {
      const { email, password } = req.body as { email: string; password: string }
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown'
      const result = await service.login(email, password, ip)
      setRefreshCookie(res, result.refreshToken)
      res.json(stripRefresh(result))
    },

    async refresh(req: Request, res: Response) {
      const refreshToken = readRefreshToken(req)
      if (!refreshToken) throw Unauthorized('No refresh token provided.')
      const result = await service.refresh(refreshToken)
      setRefreshCookie(res, result.refreshToken)
      res.json(stripRefresh(result))
    },

    async logout(req: Request, res: Response) {
      await service.logout(readRefreshToken(req) ?? undefined)
      clearRefreshCookie(res)
      res.json({ ok: true })
    },

    async me(req: Request, res: Response) {
      const admin = await service.me(req.user!.id)
      res.json({ admin })
    },
  }
}