import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export interface Cache {
  get(key: string): Promise<Buffer | undefined>
  set(key: string, value: Buffer): Promise<void>
}

export function cacheKey(...parts: string[]): string {
  return createHash('sha256').update(parts.join('\n')).digest('hex')
}

export function createDiskCache(dir: string, ttlSeconds: number): Cache {
  const pathFor = (key: string) => join(dir, key.slice(0, 2), key)

  return {
    async get(key) {
      const file = pathFor(key)
      try {
        const info = await stat(file)
        if (ttlSeconds > 0 && Date.now() - info.mtimeMs > ttlSeconds * 1000) return undefined
        return await readFile(file)
      } catch {
        return undefined
      }
    },
    async set(key, value) {
      const file = pathFor(key)
      await mkdir(join(dir, key.slice(0, 2)), { recursive: true })
      const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
      await writeFile(tmp, value)
      await rename(tmp, file)
    },
  }
}

export function createMemoryCache(): Cache {
  const store = new Map<string, Buffer>()
  return {
    async get(key) {
      return store.get(key)
    },
    async set(key, value) {
      store.set(key, value)
    },
  }
}
