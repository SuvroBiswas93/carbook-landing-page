import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { ApiError } from '../lib/apiError'

function isBodyParserError(error: unknown): error is { type?: string; status?: number } {
  return typeof error === 'object' && error !== null
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (res.locals.requestId as string | undefined) ?? '-'

  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      console.error(`${error.code} ${error.message} reqId=${requestId}`)
    }
    res.status(error.statusCode).json({
      error: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    })
    return
  }

  if (isBodyParserError(error)) {
    if (error.status === 413 || error.type === 'entity.too.large') {
      res.status(413).json({ error: 'Request body is too large.' })
      return
    }
    if (error.status === 400 || error.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON payload.' })
      return
    }
  }

  console.error(`Unhandled error ${(error as Error)?.message ?? error} reqId=${requestId}`)
  if (error instanceof Error && error.stack) console.error(error.stack)
  res.status(500).json({ error: 'Internal server error.' })
}