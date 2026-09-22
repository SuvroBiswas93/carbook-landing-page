import { z } from 'zod'

export const presignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(100),
  size: z.number().int().positive(),
})

export const keySchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9/_-]+(\.[a-zA-Z0-9]{1,5})?$/, 'Invalid object key.'),
})