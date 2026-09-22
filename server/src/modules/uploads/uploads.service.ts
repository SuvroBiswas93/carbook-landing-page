import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import type { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomBytes } from 'node:crypto'
import { env } from '../../config/env'
import { r2Client, r2Enabled, r2Endpoint } from './r2.client'
import { BadRequest, ServiceUnavailable } from '../../lib/apiError'

export const R2_CACHE_CONTROL = 'public, max-age=94608000, immutable'

const ALLOWED_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
}

const KEY_PATTERN = /^fleet\/[A-Za-z0-9-]+\.[a-z0-9]{1,5}$/

async function requireR2(): Promise<S3Client> {
  if (!r2Enabled || !r2Client) {
    throw ServiceUnavailable('R2 storage is not configured on the server.')
  }
  return r2Client
}

export interface PresignedUpload {
  key: string
  uploadUrl: string
  publicUrl: string
  contentType: string
  expiresIn: number
  cacheControl: string
}

export function createUploadsService() {
  async function presign(params: {
    fileName: string
    contentType: string
    size: number
  }): Promise<PresignedUpload> {
    const client = await requireR2()

    const ext = params.fileName.split('.').pop()?.toLowerCase() ?? ''
    const expectedType = ALLOWED_TYPES[ext]
    if (!expectedType) {
      throw BadRequest('Unsupported file type. Allowed: jpg, png, webp, avif, gif.')
    }
    if (expectedType !== params.contentType) {
      throw BadRequest('File type does not match its extension.')
    }
    if (
      !Number.isInteger(params.size) ||
      params.size <= 0 ||
      params.size > env.R2_MAX_FILE_SIZE_BYTES
    ) {
      throw BadRequest(
        `File size must be at least 1 byte and no larger than ${Math.floor(
          env.R2_MAX_FILE_SIZE_BYTES / 1024 / 1024
        )}MB.`
      )
    }

    const key = `fleet/${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: expectedType,
      CacheControl: R2_CACHE_CONTROL,
      ContentLength: params.size,
    })

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: env.R2_UPLOAD_TTL_SECONDS,
    })

    const bucketBase = r2Endpoint ? `${r2Endpoint}/${env.R2_BUCKET_NAME}` : ''
    const publicBase = env.R2_PUBLIC_URL.trim().replace(/\/+$/, '') || bucketBase
    const publicUrl = publicBase ? `${publicBase}/${key}` : key

    return {
      key,
      uploadUrl,
      publicUrl,
      contentType: expectedType,
      expiresIn: env.R2_UPLOAD_TTL_SECONDS,
      cacheControl: R2_CACHE_CONTROL,
    }
  }

  async function remove(key: string): Promise<{ ok: true }> {
    const client = await requireR2()
    if (!KEY_PATTERN.test(key) || key.includes('..')) {
      throw BadRequest('Invalid object key.')
    }
    try {
      await client.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
      )
    } catch (error) {
      if ((error as { name?: string })?.name === 'NoSuchKey') return { ok: true }
      throw error
    }
    return { ok: true }
  }

  async function uploadImage(params: { originalName: string; contentType: string; size: number; body: Buffer }): Promise<{ publicUrl: string; cacheControl: string }> {
    const client = await requireR2()
    const ext = params.originalName.split('.').pop()?.toLowerCase() ?? ''
    const expectedType = ALLOWED_TYPES[ext]
    if (!expectedType || expectedType !== params.contentType) {
      throw BadRequest('Unsupported file type. Allowed: jpg, png, webp, avif, gif.')
    }
    if (!Number.isInteger(params.size) || params.size <= 0 || params.size > env.R2_MAX_FILE_SIZE_BYTES) {
      throw BadRequest(`File size must be at least 1 byte and no larger than ${Math.floor(env.R2_MAX_FILE_SIZE_BYTES / 1024 / 1024)}MB.`)
    }

    const key = `fleet/${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
    await client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: params.body,
      ContentType: expectedType,
      CacheControl: R2_CACHE_CONTROL,
      ContentLength: params.size,
    }))

    const publicBase = env.R2_PUBLIC_URL.trim().replace(/\/+$/, '')
    return { publicUrl: `${publicBase}/${key}`, cacheControl: R2_CACHE_CONTROL }
  }

  return { presign, remove, uploadImage }
}

export type UploadsService = ReturnType<typeof createUploadsService>