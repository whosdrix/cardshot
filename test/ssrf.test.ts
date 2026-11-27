import { describe, expect, it } from 'vitest'
import { assertPublicUrl, createHostCheck, isPrivateAddress } from '../src/shot/ssrf.js'

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    'not-an-ip',
  ])('blocks %s', (ip) => {
    expect(isPrivateAddress(ip)).toBe(true)
  })

  it.each(['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111'])('allows %s', (ip) => {
    expect(isPrivateAddress(ip)).toBe(false)
  })
})

describe('assertPublicUrl', () => {
  const check = createHostCheck(false)

  it.each([
    ['ftp://example.com', 400],
    ['file:///etc/passwd', 400],
    ['not a url', 400],
    ['http://user:pass@example.com', 400],
    ['http://localhost:3000', 403],
    ['http://127.0.0.1', 403],
    ['http://[::1]/', 403],
    ['http://metadata.google.internal', 403],
  ])('rejects %s', async (url, status) => {
    await expect(assertPublicUrl(url, check)).rejects.toMatchObject({ status })
  })

  it('allows anything when private urls are enabled', async () => {
    const url = await assertPublicUrl('http://127.0.0.1:3000', createHostCheck(true))
    expect(url.hostname).toBe('127.0.0.1')
  })
})
