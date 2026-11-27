import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { z } from 'zod'
import { fromZod, HttpError } from '../lib/errors.js'
import type { HostCheck } from '../shot/ssrf.js'
import { loadFonts } from './fonts.js'
import { fetchImage } from './images.js'
import { templates } from './templates/index.js'

export const ogOptions = z.object({
  template: z.string().default('basic'),
  w: z.coerce.number().int().min(200).max(2400).default(1200),
  h: z.coerce.number().int().min(200).max(2400).default(630),
  scale: z.coerce.number().min(1).max(3).default(1),
  format: z.enum(['png', 'svg']).default('png'),
})

export interface OgResult {
  body: Buffer
  contentType: string
}

export async function renderOg(
  query: Record<string, string>,
  deps: { checkHost: HostCheck },
): Promise<OgResult> {
  const { template: _t, w: _w, h: _h, scale: _s, format: _f, ...rest } = query
  const options = ogOptions.safeParse({ template: _t, w: _w, h: _h, scale: _s, format: _f })
  if (!options.success) throw fromZod(options.error)
  const { template: name, w, h, scale, format } = options.data

  const template = templates[name]
  if (!template) {
    throw new HttpError(404, `Unknown template "${name}"`, { templates: Object.keys(templates) })
  }

  const parsed = template.params.strict().safeParse(rest)
  if (!parsed.success) throw fromZod(parsed.error)
  const params: Record<string, unknown> = { ...parsed.data }

  await Promise.all(
    template.imageParams.map(async (key) => {
      const value = params[key]
      if (typeof value === 'string' && value) {
        params[key] = await fetchImage(value, deps.checkHost)
      }
    }),
  )

  const svg = await satori(template.render(params as never, { width: w, height: h }), {
    width: w,
    height: h,
    fonts: await loadFonts(),
  })

  if (format === 'svg') {
    return { body: Buffer.from(svg), contentType: 'image/svg+xml' }
  }

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: Math.round(w * scale) },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng()
  return { body: png, contentType: 'image/png' }
}
