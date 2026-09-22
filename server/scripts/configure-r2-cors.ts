import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '../src/config/env'
import { r2Endpoint, r2Enabled } from '../src/modules/uploads/r2.client'

if (!r2Enabled || !r2Endpoint) {
  throw new Error('R2 is not fully configured. Set the R2 credentials, bucket, and public URL first.')
}

const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

async function main(): Promise<void> {
  const client = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })

  await client.send(new PutBucketCorsCommand({
    Bucket: env.R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: allowedOrigins,
          AllowedMethods: ['PUT', 'GET', 'HEAD'],
          AllowedHeaders: ['Content-Type', 'Cache-Control', 'x-amz-*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }))

  console.log(`R2 CORS configured for ${env.R2_BUCKET_NAME}: ${allowedOrigins.join(', ')}`)
}

main().catch((error) => {
  console.error('Could not configure R2 CORS:', error)
  process.exit(1)
})
