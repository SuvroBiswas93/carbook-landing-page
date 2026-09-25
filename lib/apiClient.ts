'use client'

const STORAGE_KEY = 'tb_access_token'
const STORAGE_TS_KEY = 'tb_access_token_ts'
// 9 minutes valid to leave 1 min buffer before 10m expiry
const TOKEN_VALID_MS = 9 * 60 * 1000

let accessToken: string | null = null

function persistToken(token: string | null): void {
  accessToken = token
  if (typeof window === 'undefined') return
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
      localStorage.setItem(STORAGE_TS_KEY, String(Date.now()))
    } else {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_TS_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

function loadTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const token = localStorage.getItem(STORAGE_KEY)
    const ts = localStorage.getItem(STORAGE_TS_KEY)
    if (!token || !ts) return null
    const age = Date.now() - Number(ts)
    if (Number.isNaN(age) || age > TOKEN_VALID_MS || age < 0) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_TS_KEY)
      return null
    }
    return token
  } catch {
    return null
  }
}

// Init from storage synchronously on module load (client only)
if (typeof window !== 'undefined') {
  const cached = loadTokenFromStorage()
  if (cached) accessToken = cached
}

export function setAccessToken(token: string | null): void {
  persistToken(token)
}

export function getAccessToken(): string | null {
  // If in-memory is null but storage has valid token, restore it
  if (!accessToken && typeof window !== 'undefined') {
    const cached = loadTokenFromStorage()
    if (cached) accessToken = cached
  }
  return accessToken
}

export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    // Avoid redirect loop if already on login
    if (window.location.pathname.startsWith('/admin/login')) return
    window.location.replace('/admin/login')
  }
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      credentials: 'same-origin',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!response.ok) return false
    const data = (await response.json().catch(() => null)) as {
      accessToken?: string
    } | null
    if (!data?.accessToken) return false
    persistToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

let refreshing: Promise<boolean> | null = null

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const signal = controller.signal
  // Merge signals if init already has one
  const finalInit: RequestInit = { ...init, signal: init.signal ?? signal }
  // If init had a signal, we need to abort our controller when it aborts - simplified: just use ours
  return fetch(input, finalInit).finally(() => clearTimeout(timeout))
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const run = (): Promise<Response> => {
    const headers = new Headers(init.headers)
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    // Use timeout for admin data fetches
    return fetchWithTimeout(input, { ...init, headers, credentials: 'same-origin' }, 10000)
  }

  let response: Response
  try {
    response = await run()
  } catch (error) {
    // Network error - don't redirect, let caller handle
    throw error
  }

  if (response.status === 401) {
    // Dedupe refresh attempts
    if (!refreshing) {
      refreshing = attemptRefresh().finally(() => {
        // Use microtask to clear so concurrent waiters get same promise
        setTimeout(() => {
          refreshing = null
        }, 0)
      })
    }
    const refreshed = await refreshing
    if (refreshed) {
      return run()
    }
    persistToken(null)
    redirectToLogin()
  }

  return response
}
