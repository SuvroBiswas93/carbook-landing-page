import { randomUUID } from 'node:crypto'
import { readJson, writeJson } from '../lib/jsonStore'
import type { AdminUser } from '../domain'

export interface AdminsRepo {
  list(): Promise<AdminUser[]>
  getById(id: string): Promise<AdminUser | null>
  getByEmail(email: string): Promise<AdminUser | null>
  create(admin: Omit<AdminUser, 'id'>): Promise<AdminUser>
}

export const jsonAdminsRepo: AdminsRepo = {
  async list() {
    return readJson<AdminUser[]>('admins.json', [])
  },

  async getById(id) {
    const admins = await readJson<AdminUser[]>('admins.json', [])
    return admins.find((admin) => admin.id === id) ?? null
  },

  async getByEmail(email) {
    const admins = await readJson<AdminUser[]>('admins.json', [])
    const needle = email.trim().toLowerCase()
    return admins.find((admin) => admin.email.toLowerCase() === needle) ?? null
  },

  async create(admin) {
    const admins = await readJson<AdminUser[]>('admins.json', [])
    const created: AdminUser = { ...admin, id: randomUUID() }
    admins.push(created)
    await writeJson('admins.json', admins)
    return created
  },
}