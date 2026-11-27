import { z } from 'zod'
import { defineTemplate } from '../template.js'
import { fitTitle, palettes, themeParams } from '../theme.js'
import { Avatar, Brand, Frame } from './parts.js'

export const quote = defineTemplate({
  name: 'quote',
  description: 'A testimonial or pull quote with the author and their role.',
  params: z.object({
    quote: z.string().min(1).max(240),
    author: z.string().min(1).max(60),
    role: z.string().max(80).optional(),
    avatar: z.string().max(2048).optional(),
    site: z.string().max(60).optional(),
    logo: z.string().max(2048).optional(),
    ...themeParams,
  }),
  imageParams: ['avatar', 'logo'],
  example: {
    quote: 'We replaced a paid screenshot service with one container and never looked back.',
    author: 'Alex Novak',
    role: 'CTO, Example Studio',
    accent: '10b981',
  },
  render(p) {
    const palette = palettes[p.theme]
    return (
      <Frame palette={palette} accent={p.accent}>
        <div
          style={{
            display: 'flex',
            fontSize: 160,
            lineHeight: 0.8,
            height: 90,
            fontWeight: 800,
            color: p.accent,
          }}
        >
          “
        </div>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: fitTitle(p.quote, [64, 56, 48, 40]),
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            {p.quote}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar src={p.avatar} name={p.author} size={72} accent={p.accent} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', fontSize: 30, fontWeight: 700 }}>{p.author}</div>
              {p.role ? (
                <div style={{ display: 'flex', fontSize: 24, color: palette.muted }}>{p.role}</div>
              ) : null}
            </div>
          </div>
          <Brand site={p.site} logo={p.logo} palette={palette} accent={p.accent} />
        </div>
      </Frame>
    )
  },
})
