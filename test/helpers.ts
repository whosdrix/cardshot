import { createApp } from '../src/app.js'
import { type Config, loadConfig } from '../src/config.js'
import { createMemoryCache } from '../src/lib/cache.js'
import type { BrowserProvider } from '../src/shot/browser.js'

export const fakeBrowser: BrowserProvider = {
  get: () => Promise.reject(new Error('browser not available in unit tests')),
  close: async () => {},
}

export function testApp(overrides: Partial<Config> = {}) {
  const config = { ...loadConfig({}), ...overrides }
  return createApp({
    config,
    cache: createMemoryCache(),
    browser: fakeBrowser,
    checkHost: async () => false,
  })
}

export function pngSize(body: ArrayBuffer): { width: number; height: number } {
  const view = new DataView(body)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}
