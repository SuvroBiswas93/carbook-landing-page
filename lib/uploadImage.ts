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
  const fallbackName = `car-${Date.now()}.${EXT_BY_TYPE[file.type] ?? 'jpg'}`
  const fileName = file.name?.trim() ? file.name : fallbackName

  const response = await apiFetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName,
      contentType: file.type,
      size: file.size,
    }),
  })

  const data = (await response.json().catch(() => null)) as {
    uploadUrl?: string
    publicUrl?: string
    cacheControl?: string
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(data?.error ?? 'Could not start the upload.')
  }
  if (!data?.uploadUrl || !data.publicUrl) {
    throw new Error('Upload response was incomplete.')
  }

  const put = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'Cache-Control': data.cacheControl ?? R2_CACHE_CONTROL,
    },
    body: file,
  })

  if (!put.ok) {
    throw new Error(`Upload failed with status ${put.status}.`)
  }

  return data.publicUrl
}