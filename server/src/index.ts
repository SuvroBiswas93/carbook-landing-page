import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { createApp } from './app'
import { env } from './config/env'
import { REPO_ROOT } from './config/paths'
import { logger } from './lib/logger'

const execAsync = promisify(exec)

async function ensurePrismaSchema(): Promise<void> {
  if (env.DATA_SOURCE !== 'prisma') return

  const prismaCommand = path.join(
    REPO_ROOT,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
  )
  const schemaPath = path.join(REPO_ROOT, 'server', 'prisma', 'schema.prisma')
  logger.info('Synchronizing Prisma schema before starting the API server')

  await execAsync(
    `"${prismaCommand}" db push --schema "${schemaPath}" --skip-generate`,
    { cwd: REPO_ROOT, env: process.env, windowsHide: true },
  )
}

async function start(): Promise<void> {
  await ensurePrismaSchema()
  const app = createApp()
  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`API server listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`)
  })

  server.requestTimeout = 60_000
  server.headersTimeout = 70_000
  server.timeout = 60_000
  server.keepAliveTimeout = 5_000

  function shutdown(signal: string): void {
    logger.info(`Received ${signal}, shutting down gracefully`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch((error) => {
  logger.error('Could not initialize the database schema', error)
  process.exit(1)
})