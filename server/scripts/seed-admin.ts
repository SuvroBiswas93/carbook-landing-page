import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { env } from '../src/config/env'
import { jsonAdminsRepo } from '../src/repos/adminsRepo'

async function main() {
  console.log(`[seed-admin] data source: ${env.DATA_SOURCE}`)
  if (env.DATA_SOURCE === 'prisma') {
    console.error('[seed-admin] Prisma data source is not wired up yet. Set DATA_SOURCE=json.')
    process.exit(1)
  }

  const email = env.ADMIN_EMAIL.trim().toLowerCase()
  const existing = await jsonAdminsRepo.getByEmail(email)
  if (existing) {
    console.log(`[seed-admin] Admin "${email}" already exists (id=${existing.id}). Nothing to do.`)
    return
  }

  const password = env.ADMIN_PASSWORD || randomBytes(12).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)

  await jsonAdminsRepo.create({
    email,
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  })

  console.log(`[seed-admin] Created admin "${email}".`)
  if (!env.ADMIN_PASSWORD) {
    console.log('[seed-admin] ADMIN_PASSWORD was not set - the generated password is:')
    console.log(`[seed-admin]   ${password}`)
    console.log('[seed-admin] Store it somewhere safe and remove it from logs.')
  }
}

main().catch((error) => {
  console.error('[seed-admin] Failed:', error)
  process.exit(1)
})