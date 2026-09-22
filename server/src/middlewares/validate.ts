import type { NextFunction, Request, Response } from 'express'
import type { ZodType, ZodTypeDef, output } from 'zod'
import { BadRequest } from '../lib/apiError'

type Source = 'body' | 'query' | 'params'

function firstErrorMessage(error: { issues: { path: (string | number)[]; message: string }[] }): string {
  const first = error.issues[0]
  if (!first) return 'Invalid request payload.'
  const field = first.path.join('.') || 'value'
  return `${field}: ${first.message}`
}

export function validate<S extends ZodType<unknown, ZodTypeDef, any>>(
  schema: S,
  source: Source = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as Record<Source, unknown>)[source] ?? {})
    if (!result.success) {
      return next(BadRequest(firstErrorMessage(result.error)))
    }
    ;(req as Record<Source, unknown>)[source] = result.data as output<S>
    next()
  }
}