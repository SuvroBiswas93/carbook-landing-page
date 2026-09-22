import { readJson, writeJson } from '../lib/jsonStore'
import type { Session } from '../domain'

export interface SessionsRepo {
  getById(id: string): Promise<Session | null>
  create(session: Omit<Session, 'revokedAt'>): Promise<Session>
  revoke(id: string): Promise<void>
  revokeAllForAdmin(adminId: string): Promise<void>
  prune(now?: number): Promise<void>
}

export const jsonSessionsRepo: SessionsRepo = {
  async getById(id) {
    const sessions = await readJson<Session[]>('sessions.json', [])
    return sessions.find((session) => session.id === id) ?? null
  },

  async create(session) {
    const sessions = await readJson<Session[]>('sessions.json', [])
    sessions.push({ ...session, revokedAt: null })
    await writeJson('sessions.json', sessions)
    return { ...session, revokedAt: null }
  },

  async revoke(id) {
    const sessions = await readJson<Session[]>('sessions.json', [])
    const index = sessions.findIndex((session) => session.id === id)
    if (index === -1) return
    sessions[index] = { ...sessions[index], revokedAt: new Date().toISOString() }
    await writeJson('sessions.json', sessions)
  },

  async revokeAllForAdmin(adminId) {
    const sessions = await readJson<Session[]>('sessions.json', [])
    const now = new Date().toISOString()
    const next = sessions.map((session) =>
      session.adminId === adminId && session.revokedAt === null
        ? { ...session, revokedAt: now }
        : session
    )
    await writeJson('sessions.json', next)
  },

  async prune(now = Date.now()) {
    const sessions = await readJson<Session[]>('sessions.json', [])
    const retention = 30 * 24 * 60 * 60 * 1000
    const next = sessions.filter((session) => {
      if (session.expiresAt > now) return true
      const revokedAt = session.revokedAt ? new Date(session.revokedAt).getTime() : 0
      return now - revokedAt < retention
    })
    if (next.length !== sessions.length) {
      await writeJson('sessions.json', next)
    }
  },
}