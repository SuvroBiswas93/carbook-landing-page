import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),

  JWT_ACCESS_SECRET: z.string().default(''),
  JWT_REFRESH_SECRET: z.string().default(''),
  ACCESS_TOKEN_TTL: z.string().default('10m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),

  DATA_SOURCE: z.enum(['json', 'prisma']).default('json'),

  ADMIN_EMAIL: z.string().default('admin@travelingbangladesh.local'),
  ADMIN_PASSWORD: z.string().default(''),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_GLOBAL_LIMIT: z.coerce.number().int().positive().default(300),
  LOGIN_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  LOGIN_LIMIT: z.coerce.number().int().positive().default(5),
  LOGIN_MAX_FAILURES: z.coerce.number().int().positive().default(5),
  LOGIN_LOCKOUT_MS: z.coerce.number().int().positive().default(900_000),

  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default(''),
  R2_PUBLIC_URL: z.string().default(''),
  R2_UPLOAD_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  R2_MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('[env] Invalid or missing environment variables:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

const raw = parsed.data

function resolveSecret(value: string, name: string): string {
  if (value.length >= 32) return value
  if (raw.NODE_ENV === 'production') {
    console.error(`[env] ${name} must be set to at least 32 characters in production.`)
    process.exit(1)
  }
  const ephemeral = `dev_${randomBytes(32).toString('hex')}`
  console.warn(
    `[env] ${name} is not set - using an ephemeral ${raw.NODE_ENV} secret. ` +
      'Set it in .env for sessions to survive server restarts.'
  )
  return ephemeral
}

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  JWT_ACCESS_SECRET: resolveSecret(raw.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: resolveSecret(raw.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  trustProxy: raw.TRUST_PROXY === 0 ? false : raw.TRUST_PROXY,
}

export type Env = typeof env