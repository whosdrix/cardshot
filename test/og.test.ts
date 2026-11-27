import { describe, expect, it } from 'vitest'
import { templates } from '../src/og/templates/index.js'
import { pngSize, testApp } from './helpers.js'

describe('GET /og', () => {
  const app = testApp()

  it.each(Object.values(templates).map((t) => [t.name, t.example] as const))(
    'renders the %s example',
    async (name, example) => {
      const res = await app.request(`/og?${new URLSearchParams({ template: name, ...example })}`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('image/png')
      expect(pngSize(await res.arrayBuffer())).toEqual({ width: 1200, height: 630 })
    },
  )

  it('honours size and scale', async () => {
    const res = await app.request('/og?title=Hi&w=800&h=800&scale=2')
    expect(pngSize(await res.arrayBuffer())).toEqual({ width: 1600, height: 1600 })
  })

  it('returns svg when asked', async () => {
    const res = await app.request('/og?title=Hi&format=svg')
    expect(res.headers.get('content-type')).toBe('image/svg+xml')
    expect(await res.text()).toMatch(/^<svg/)
  })

  it('serves repeat requests from cache with an etag', async () => {
    const first = await app.request('/og?title=Cached')
    const second = await app.request('/og?title=Cached')
    expect(first.headers.get('x-cache')).toBe('MISS')
    expect(second.headers.get('x-cache')).toBe('HIT')

    const etag = second.headers.get('etag') ?? ''
    const third = await app.request('/og?title=Cached', { headers: { 'if-none-match': etag } })
    expect(third.status).toBe(304)
  })

  it('rejects unknown params and templates', async () => {
    const unknown = await app.request('/og?title=Hi&colour=red')
    expect(unknown.status).toBe(400)
    expect(await unknown.json()).toMatchObject({ details: [{ param: 'colour' }] })

    expect((await app.request('/og?template=nope&title=Hi')).status).toBe(404)
    expect((await app.request('/og?template=basic')).status).toBe(400)
    expect((await app.request('/og?title=Hi&accent=blue')).status).toBe(400)
  })

  it('drops images it cannot fetch safely instead of failing', async () => {
    const res = await app.request('/og?title=Hi&logo=http://127.0.0.1/logo.png')
    expect(res.status).toBe(200)
  })
})

describe('signed urls', () => {
  const app = testApp({ signingSecret: 'secret' })

  it('requires a signature when a secret is set', async () => {
    expect((await app.request('/og?title=Hi')).status).toBe(401)
    expect((await app.request('/shot?url=https://example.com')).status).toBe(401)
  })

  it('accepts the signed example urls from /templates', async () => {
    const list = (await (await app.request('/templates')).json()) as Array<{ example: string }>
    const first = list[0]
    expect(first).toBeDefined()
    expect((await app.request(first?.example ?? '')).status).toBe(200)
  })
})

describe('misc routes', () => {
  const app = testApp()

  it('reports health', async () => {
    expect(await (await app.request('/health')).json()).toMatchObject({ ok: true })
  })

  it('renders the gallery', async () => {
    const html = await (await app.request('/')).text()
    for (const name of Object.keys(templates)) expect(html).toContain(`template=${name}`)
  })
})
