import { mkdir } from 'node:fs/promises'
import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import type { Config } from './config.js'
import { createDiskCache } from './lib/cache.js'
import { createBrowserProvider } from './shot/browser.js'
import { createHostCheck } from './shot/ssrf.js'

export async function startServer(config: Config) {
  await mkdir(config.cacheDir, { recursive: true })
  const browser = createBrowserProvider(config.chromiumPath)
  const app = createApp({
    config,
    cache: createDiskCache(config.cacheDir, config.cacheTtl),
    browser,
    checkHost: createHostCheck(config.allowPrivateUrls),
  })

  const server = serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
    console.log(`cardshot listening on http://${info.address}:${info.port}`)
    if (!config.signingSecret) {
      console.warn('SIGNING_SECRET is not set: anyone who can reach this server can use it.')
    }
  })

  const shutdown = async () => {
    server.close()
    await browser.close()
    process.exit(0)
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)

  return server
}
