'use client'

import { apiFetch } from './apiClient'

export const R2_CACHE_CONTROL = 'public, max-age=94608000, immutable'

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

export async function uploadCarImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file, file.name || `car-${Date.now()}.${EXT_BY_TYPE[file.type] ?? 'jpg'}`)

  const response = await apiFetch('/api/uploads/image', {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as {
    publicUrl?: string
    cacheControl?: string
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(data?.error ?? 'Could not start the upload.')
  }
  if (!data?.publicUrl) {
    throw new Error('Upload response was incomplete.')
  }

  return data.publicUrl
}