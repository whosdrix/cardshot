import { type Browser, chromium } from 'playwright-core'

export interface BrowserProvider {
  get(): Promise<Browser>
  close(): Promise<void>
}

export function createBrowserProvider(executablePath?: string): BrowserProvider {
  let pending: Promise<Browser> | undefined

  const launch = async () => {
    const browser = await chromium.launch({
      executablePath: executablePath || undefined,
      args: ['--disable-dev-shm-usage', '--no-first-run', '--mute-audio', '--hide-scrollbars'],
    })
    browser.on('disconnected', () => {
      pending = undefined
    })
    return browser
  }

  return {
    get() {
      if (!pending) {
        pending = launch().catch((error: unknown) => {
          pending = undefined
          throw error
        })
      }
      return pending
    },
    async close() {
      const current = pending
      pending = undefined
      if (current) await (await current).close().catch(() => {})
    },
  }
}
