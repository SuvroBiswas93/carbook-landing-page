import { env } from '../../config/env'

interface AttemptState {
  failures: number
  lockedUntil: number | null
}

const attempts = new Map<string, AttemptState>()
const PRUNE_INTERVAL_MS = 10 * 60 * 1000

export function isLockedOut(key: string): boolean {
  const state = attempts.get(key)
  return Boolean(state?.lockedUntil && state.lockedUntil > Date.now())
}

export function registerFailure(key: string): { locked: boolean; lockedUntil: number | null } {
  const now = Date.now()
  const state = attempts.get(key) ?? { failures: 0, lockedUntil: null }
  const failures = state.failures + 1
  const lockedUntil =
    failures >= env.LOGIN_MAX_FAILURES ? now + env.LOGIN_LOCKOUT_MS : state.lockedUntil
  attempts.set(key, { failures, lockedUntil })
  return { locked: Boolean(lockedUntil && lockedUntil > now), lockedUntil }
}

export function resetAttempts(key: string): void {
  attempts.delete(key)
}

function prune(): void {
  const now = Date.now()
  for (const [key, state] of attempts) {
    if (state.lockedUntil && state.lockedUntil <= now) {
      attempts.delete(key)
    }
  }
}

setInterval(prune, PRUNE_INTERVAL_MS).unref()