import { z } from 'zod'
import { defineTemplate } from '../template.js'
import { fitTitle, palettes, themeParams } from '../theme.js'
import { Brand, Frame } from './parts.js'

export const basic = defineTemplate({
  name: 'basic',
  description: 'A bold title with an optional subtitle, site name and logo.',
  params: z.object({
    title: z.string().min(1).max(140),
    subtitle: z.string().max(200).optional(),
    site: z.string().max(60).optional(),
    logo: z.string().max(2048).optional(),
    ...themeParams,
  }),
  imageParams: ['logo'],
  example: {
    title: 'Ship social cards in one request',
    subtitle: 'Self-hosted OG images and screenshots for every page you publish.',
    site: 'cardshot',
  },
  render(p) {
    const palette = palettes[p.theme]
    return (
      <Frame palette={palette} accent={p.accent}>
        <Brand site={p.site} logo={p.logo} palette={palette} accent={p.accent} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'center',
            gap: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: fitTitle(p.title, [88, 72, 60, 50]),
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            {p.title}
          </div>
          {p.subtitle ? (
            <div style={{ display: 'flex', fontSize: 32, color: palette.muted, lineHeight: 1.4 }}>
              {p.subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 8,
            borderRadius: 999,
            backgroundColor: p.accent,
          }}
        />
      </Frame>
    )
  },
})
