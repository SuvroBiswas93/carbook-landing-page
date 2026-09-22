export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const BadRequest = (message: string, details?: unknown) =>
  new ApiError(400, 'BAD_REQUEST', message, details)

export const Unauthorized = (message: string) =>
  new ApiError(401, 'UNAUTHORIZED', message)

export const Forbidden = (message: string) =>
  new ApiError(403, 'FORBIDDEN', message)

export const NotFound = (message: string) =>
  new ApiError(404, 'NOT_FOUND', message)

export const Conflict = (message: string) =>
  new ApiError(409, 'CONFLICT', message)

export const TooManyRequests = (message: string) =>
  new ApiError(429, 'RATE_LIMITED', message)

export const ServiceUnavailable = (message: string) =>
  new ApiError(503, 'SERVICE_UNAVAILABLE', message)