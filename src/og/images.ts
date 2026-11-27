import type { HostCheck } from '../shot/ssrf.js'

const MAX_BYTES = 2 * 1024 * 1024
const TIMEOUT_MS = 5000

export async function fetchImage(raw: string, checkHost: HostCheck): Promise<string | undefined> {
  if (raw.startsWith('data:image/')) return raw
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return undefined
  }

  for (let hop = 0; hop < 4; hop++) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
    if (!(await checkHost(url.hostname))) return undefined

    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: 'image/png,image/jpeg,image/svg+xml,image/webp,image/gif' },
    }).catch(() => undefined)
    if (!response) return undefined

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) return undefined
      url = new URL(location, url)
      continue
    }
    if (!response.ok) return undefined

    const type = response.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
    if (!type.startsWith('image/')) return undefined
    if (Number(response.headers.get('content-length') ?? 0) > MAX_BYTES) return undefined

    const body = Buffer.from(await response.arrayBuffer())
    if (body.byteLength > MAX_BYTES) return undefined
    return `data:${type};base64,${body.toString('base64')}`
  }
  return undefined
}
