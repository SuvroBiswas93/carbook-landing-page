'use client'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.replace('/admin/login')
  }
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      credentials: 'same-origin',
    })
    if (!response.ok) return false
    const data = (await response.json().catch(() => null)) as {
      accessToken?: string
    } | null
    if (!data?.accessToken) return false
    accessToken = data.accessToken
    return true
  } catch {
    return false
  }
}

let refreshing: Promise<boolean> | null = null

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const run = (): Promise<Response> => {
    const headers = new Headers(init.headers)
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(input, { ...init, headers, credentials: 'same-origin' })
  }

  const response = await run()

  if (response.status === 401) {
    refreshing = refreshing ?? attemptRefresh().finally(() => (refreshing = null))
    const refreshed = await refreshing
    if (refreshed) {
      return run()
    }
    setAccessToken(null)
    redirectToLogin()
  }

  return response
}