import { existsSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createBrowserProvider } from '../src/shot/browser.js'
import { shotParams } from '../src/shot/params.js'
import { takeScreenshot } from '../src/shot/screenshot.js'
import { createHostCheck } from '../src/shot/ssrf.js'
import { pngSize, testApp } from './helpers.js'

describe('shot params', () => {
  it('applies defaults', () => {
    expect(shotParams.parse({ url: 'https://example.com' })).toMatchObject({
      width: 1280,
      height: 800,
      format: 'png',
      fullPage: false,
      clean: true,
    })
  })

  it('validates limits', () => {
    expect(shotParams.safeParse({ url: 'https://x.com', width: '99999' }).success).toBe(false)
    expect(shotParams.safeParse({ url: 'https://x.com', delay: '60000' }).success).toBe(false)
    expect(shotParams.safeParse({ url: 'https://x.com', nope: '1' }).success).toBe(false)
  })

  it('rejects private targets before launching a browser', async () => {
    const res = await testApp().request('/shot?url=http://169.254.169.254/latest/meta-data')
    expect(res.status).toBe(403)
  })
})

const chromium = process.env.CHROMIUM_PATH
const canLaunch = Boolean(chromium && existsSync(chromium)) || process.env.CI_BROWSER === '1'

describe.skipIf(!canLaunch)('takeScreenshot (real browser)', () => {
  let server: Server
  let base: string
  const browser = createBrowserProvider(chromium)

  beforeAll(async () => {
    server = createServer((_, res) => {
      res.setHeader('content-type', 'text/html')
      res.end(
        '<html><body style="margin:0;background:#123"><div id="box" style="width:200px;height:100px;background:#f00"></div><div style="height:3000px"></div></body></html>',
      )
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(async () => {
    await browser.close()
    server.close()
  })

  const deps = () => ({ browser, checkHost: createHostCheck(true), timeout: 15_000 })

  it('captures the viewport', async () => {
    const shot = await takeScreenshot(
      shotParams.parse({ url: base, width: 800, height: 600 }),
      deps(),
    )
    expect(pngSize(shot.body.buffer.slice(shot.body.byteOffset) as ArrayBuffer)).toEqual({
      width: 800,
      height: 600,
    })
  })

  it('captures a single element', async () => {
    const shot = await takeScreenshot(shotParams.parse({ url: base, selector: '#box' }), deps())
    expect(pngSize(shot.body.buffer.slice(shot.body.byteOffset) as ArrayBuffer)).toEqual({
      width: 200,
      height: 100,
    })
  })

  it('captures the full page', async () => {
    const shot = await takeScreenshot(
      shotParams.parse({ url: base, width: 800, height: 600, fullPage: 'true' }),
      deps(),
    )
    const { height } = pngSize(shot.body.buffer.slice(shot.body.byteOffset) as ArrayBuffer)
    expect(height).toBeGreaterThan(3000)
  })
})
