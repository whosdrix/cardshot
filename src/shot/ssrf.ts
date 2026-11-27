import { lookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'
import { HttpError } from '../lib/errors.js'

const blocked = new BlockList()

for (const [net, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blocked.addSubnet(net, prefix, 'ipv4')
}

for (const [net, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blocked.addSubnet(net, prefix, 'ipv6')
}

export function isPrivateAddress(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, '')
  const version = isIP(ip)
  if (version === 4) return blocked.check(ip, 'ipv4')
  if (version === 6) {
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)
    if (mapped?.[1]) return blocked.check(mapped[1], 'ipv4')
    return blocked.check(ip, 'ipv6')
  }
  return true
}

export type HostCheck = (hostname: string) => Promise<boolean>

export function createHostCheck(allowPrivate: boolean): HostCheck {
  const cache = new Map<string, Promise<boolean>>()

  return (hostname) => {
    if (allowPrivate) return Promise.resolve(true)
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
    let result = cache.get(host)
    if (!result) {
      result = resolvesPublic(host)
      cache.set(host, result)
      if (cache.size > 1000) cache.delete(cache.keys().next().value as string)
    }
    return result
  }
}

async function resolvesPublic(host: string): Promise<boolean> {
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal'))
    return false
  if (isIP(host)) return !isPrivateAddress(host)
  try {
    const addresses = await lookup(host, { all: true, verbatim: true })
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address))
  } catch {
    return false
  }
}

export async function assertPublicUrl(raw: string, check: HostCheck): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new HttpError(400, 'url must be an absolute http(s) URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HttpError(400, 'url must use http or https')
  }
  if (url.username || url.password) {
    throw new HttpError(400, 'url must not contain credentials')
  }
  if (!(await check(url.hostname))) {
    throw new HttpError(403, 'url resolves to a private or unreachable address')
  }
  return url
}
