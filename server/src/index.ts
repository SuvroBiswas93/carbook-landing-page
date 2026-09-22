import { createApp } from './app'
import { env } from './config/env'
import { logger } from './lib/logger'

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