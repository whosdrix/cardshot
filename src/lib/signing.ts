import { createHmac, timingSafeEqual } from 'node:crypto'

export function canonicalQuery(params: URLSearchParams): string {
  const entries = [...params.entries()].filter(([key]) => key !== 'sig')
  entries.sort(([a, av], [b, bv]) => (a === b ? av.localeCompare(bv) : a.localeCompare(b)))
  return new URLSearchParams(entries).toString()
}

export function sign(path: string, params: URLSearchParams, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${path}?${canonicalQuery(params)}`)
    .digest('hex')
}

export function verify(path: string, params: URLSearchParams, secret: string): boolean {
  const given = params.get('sig')
  if (!given || !/^[0-9a-f]{64}$/.test(given)) return false
  const expected = sign(path, params, secret)
  return timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'))
}

export function signUrl(url: string, secret: string): string {
  const parsed = new URL(url, 'http://localhost')
  parsed.searchParams.delete('sig')
  parsed.searchParams.set('sig', sign(parsed.pathname, parsed.searchParams, secret))
  return /^https?:\/\//.test(url) ? parsed.toString() : `${parsed.pathname}${parsed.search}`
}
