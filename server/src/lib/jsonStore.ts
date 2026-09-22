import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from '../config/paths'

export function dataPath(fileName: string): string {
  return path.join(DATA_DIR, fileName)
}

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(dataPath(fileName), 'utf8')
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await fs.writeFile(dataPath(fileName), `${JSON.stringify(data, null, 2)}\n`)
}

export function nextNumericId(items: readonly { id?: number | string }[]): number {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}