import { createRequire } from 'node:module'
import { type Context, Hono } from 'hono'
import type { Config } from './config.js'
import { type Cache, cacheKey } from './lib/cache.js'
import { fromZod, HttpError } from './lib/errors.js'
import { createLimiter } from './lib/limit.js'
import { queryObject } from './lib/query.js'
import { canonicalQuery, signUrl, verify } from './lib/signing.js'
import { renderOg } from './og/render.js'
import { templates } from './og/templates/index.js'
import { galleryPage } from './pages/gallery.js'
import type { BrowserProvider } from './shot/browser.js'
import { shotParams } from './shot/params.js'
import { takeScreenshot } from './shot/screenshot.js'
import type { HostCheck } from './shot/ssrf.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

export interface AppDeps {
  config: Config
  cache: Cache
  browser: BrowserProvider
  checkHost: HostCheck
}

interface Rendered {
  body: Buffer
  contentType: string
}

export function createApp(deps: AppDeps) {
  const { config, cache } = deps
  const app = new Hono()
  const limit = createLimiter(config.shotConcurrency)
  const exampleUrl = (path: string) =>
    config.signingSecret ? signUrl(path, config.signingSecret) : path

  app.onError((error, c) => {
    if (error instanceof HttpError) {
      return c.json({ error: error.message, details: error.details }, error.status)
    }
    console.error(error)
    return c.json({ error: 'Internal error' }, 500)
  })

  app.notFound((c) => c.json({ error: 'Not found' }, 404))

  app.use('/og', requireSignature)
  app.use('/shot', requireSignature)

  async function requireSignature(c: Context, next: () => Promise<void>) {
    if (config.signingSecret) {
      const url = new URL(c.req.url)
      if (!verify(url.pathname, url.searchParams, config.signingSecret)) {
        throw new HttpError(401, 'Missing or invalid signature')
      }
    }
    await next()
  }

  async function serve(c: Context, kind: string, produce: () => Promise<Rendered>) {
    const url = new URL(c.req.url)
    const key = cacheKey(kind, canonicalQuery(url.searchParams))
    const etag = `"${key.slice(0, 32)}"`
    const headers = {
      'Cache-Control': `public, max-age=${config.cacheMaxAge}, stale-while-revalidate=86400`,
      ETag: etag,
    }

    if (c.req.header('if-none-match') === etag && (await cache.get(`${key}.type`))) {
      return c.body(null, 304, headers)
    }

    const cached = await cache.get(key)
    const cachedType = await cache.get(`${key}.type`)
    if (cached && cachedType) {
      return c.body(new Uint8Array(cached), 200, {
        ...headers,
        'Content-Type': cachedType.toString(),
        'X-Cache': 'HIT',
      })
    }

    const result = await produce()
    await cache.set(key, result.body)
    await cache.set(`${key}.type`, Buffer.from(result.contentType))
    return c.body(new Uint8Array(result.body), 200, {
      ...headers,
      'Content-Type': result.contentType,
      'X-Cache': 'MISS',
    })
  }

  app.get('/og', (c) =>
    serve(c, 'og', () =>
      renderOg(queryObject(new URL(c.req.url).searchParams), { checkHost: deps.checkHost }),
    ),
  )

  app.get('/shot', (c) => {
    const parsed = shotParams.safeParse(queryObject(new URL(c.req.url).searchParams))
    if (!parsed.success) throw fromZod(parsed.error)
    return serve(c, 'shot', () =>
      limit(() =>
        takeScreenshot(parsed.data, {
          browser: deps.browser,
          checkHost: deps.checkHost,
          timeout: config.shotTimeout,
        }),
      ),
    )
  })

  app.get('/templates', (c) =>
    c.json(
      Object.values(templates).map((t) => ({
        name: t.name,
        description: t.description,
        params: Object.keys(t.params.shape),
        example: exampleUrl(
          `/og?${new URLSearchParams({ template: t.name, ...t.example }).toString()}`,
        ),
      })),
    ),
  )

  app.get('/health', (c) => c.json({ ok: true, version }))

  app.get('/', (c) =>
    c.html(
      galleryPage(
        version,
        Object.values(templates).map((t) => ({
          name: t.name,
          description: t.description,
          src: exampleUrl(
            `/og?${new URLSearchParams({ template: t.name, ...t.example }).toString()}`,
          ),
        })),
      ),
    ),
  )

  return app
}
