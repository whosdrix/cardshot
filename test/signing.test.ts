import { describe, expect, it } from 'vitest'
import { canonicalQuery, sign, signUrl, verify } from '../src/lib/signing.js'

describe('signing', () => {
  it('ignores parameter order and the sig param', () => {
    const a = new URLSearchParams('b=2&a=1&sig=abc')
    const b = new URLSearchParams('a=1&b=2')
    expect(canonicalQuery(a)).toBe(canonicalQuery(b))
  })

  it('verifies a signed url and rejects tampering', () => {
    const signed = new URL(signUrl('/og?title=Hello', 'secret'), 'http://x')
    expect(verify(signed.pathname, signed.searchParams, 'secret')).toBe(true)
    expect(verify(signed.pathname, signed.searchParams, 'other')).toBe(false)

    signed.searchParams.set('title', 'Changed')
    expect(verify(signed.pathname, signed.searchParams, 'secret')).toBe(false)
  })

  it('binds the signature to the path', () => {
    const params = new URLSearchParams('url=https://example.com')
    params.set('sig', sign('/og', params, 'secret'))
    expect(verify('/shot', params, 'secret')).toBe(false)
  })

  it('rejects malformed signatures', () => {
    expect(verify('/og', new URLSearchParams('sig=zz'), 'secret')).toBe(false)
    expect(verify('/og', new URLSearchParams(''), 'secret')).toBe(false)
  })

  it('keeps absolute urls absolute', () => {
    expect(signUrl('https://img.example.com/og?title=a', 's')).toMatch(
      /^https:\/\/img\.example\.com\/og\?title=a&sig=[0-9a-f]{64}$/,
    )
  })
})
