import { HttpError } from '../lib/errors.js'
import type { BrowserProvider } from './browser.js'
import type { ShotParams } from './params.js'
import { assertPublicUrl, type HostCheck } from './ssrf.js'

const BANNER_SELECTORS = [
  '#onetrust-consent-sdk',
  '#CybotCookiebotDialog',
  '#usercentrics-root',
  '.cc-window',
  '.cookie-banner',
  '.cookie-consent',
  '#cookie-banner',
  '#cookie-consent',
  '[id*="cookie-notice"]',
  '[class*="CookieConsent"]',
  '[aria-label*="cookie" i][role="dialog"]',
  '.qc-cmp2-container',
  '#didomi-host',
  '.fc-consent-root',
]

export interface ShotDeps {
  browser: BrowserProvider
  checkHost: HostCheck
  timeout: number
}

export interface ShotResult {
  body: Buffer
  contentType: string
}

export async function takeScreenshot(params: ShotParams, deps: ShotDeps): Promise<ShotResult> {
  const target = await assertPublicUrl(params.url, deps.checkHost)
  const browser = await deps.browser.get()
  const context = await browser.newContext({
    viewport: { width: params.width, height: params.height },
    deviceScaleFactor: params.scale,
    colorScheme: params.dark ? 'dark' : 'light',
    serviceWorkers: 'block',
    acceptDownloads: false,
  })

  let timer: NodeJS.Timeout | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new HttpError(504, 'Screenshot timed out')), deps.timeout)
  })

  try {
    const page = await context.newPage()
    page.setDefaultTimeout(deps.timeout)

    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue()
      if (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        (await deps.checkHost(url.hostname))
      ) {
        return route.continue()
      }
      return route.abort('blockedbyclient')
    })

    const work = async () => {
      const response = await page.goto(target.toString(), { waitUntil: 'load' }).catch(() => null)
      if (!response) throw new HttpError(502, 'Could not load url')
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
      if (params.waitFor) await page.waitForSelector(params.waitFor, { state: 'visible' })

      const hide = [...params.hide, ...(params.clean ? BANNER_SELECTORS : [])]
      if (hide.length > 0) {
        await page.addStyleTag({
          content: `${hide.join(',')}{display:none!important;visibility:hidden!important}`,
        })
      }
      if (params.delay > 0) await page.waitForTimeout(params.delay)

      const options = {
        type: params.format,
        quality: params.format === 'jpeg' ? params.quality : undefined,
        animations: 'disabled' as const,
      }

      if (params.selector) {
        const element = page.locator(params.selector).first()
        if ((await element.count()) === 0) throw new HttpError(422, 'selector matched no element')
        return element.screenshot(options)
      }
      return page.screenshot({ ...options, fullPage: params.fullPage })
    }

    const body = await Promise.race([work(), deadline])
    return { body, contentType: params.format === 'jpeg' ? 'image/jpeg' : 'image/png' }
  } finally {
    clearTimeout(timer)
    await context.close().catch(() => {})
  }
}
