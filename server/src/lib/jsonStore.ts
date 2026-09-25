import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from '../config/paths'

export function dataPath(fileName: string): string {
  return path.join(DATA_DIR, fileName)
}

const memoryCache = new Map<string, { data: unknown; timestamp: number }>()
const MEMORY_CACHE_TTL = 1500 // 1.5s - makes repeated admin polling instant

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  const cached = memoryCache.get(fileName)
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
    return cached.data as T
  }
  try {
    const content = await fs.readFile(dataPath(fileName), 'utf8')
    const parsed = JSON.parse(content) as T
    memoryCache.set(fileName, { data: parsed, timestamp: Date.now() })
    return parsed
  } catch {
    return fallback
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await fs.writeFile(dataPath(fileName), `${JSON.stringify(data, null, 2)}\n`)
  // Invalidate memory cache so next read gets fresh data
  memoryCache.delete(fileName)
  // Also store new data in cache for instant subsequent reads
  memoryCache.set(fileName, { data, timestamp: Date.now() })
}

export function nextNumericId(items: readonly { id?: number | string }[]): number {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}