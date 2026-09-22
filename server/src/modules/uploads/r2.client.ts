import { S3Client } from '@aws-sdk/client-s3'
import { env } from '../../config/env'

export const r2Endpoint = env.R2_ACCOUNT_ID
  ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : ''

export const r2Enabled =
  Boolean(env.R2_ACCOUNT_ID) &&
  Boolean(env.R2_ACCESS_KEY_ID) &&
  Boolean(env.R2_SECRET_ACCESS_KEY) &&
  Boolean(env.R2_BUCKET_NAME) &&
  Boolean(env.R2_PUBLIC_URL.trim())

export const r2Client: S3Client | null = r2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      maxAttempts: 2,
    })
  : null