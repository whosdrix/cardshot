import { z } from 'zod'
import { defineTemplate } from '../template.js'
import { alpha, fitTitle, palettes, themeParams } from '../theme.js'
import { Brand, Frame } from './parts.js'

export const product = defineTemplate({
  name: 'product',
  description: 'A launch card with tagline, price, call to action and product image.',
  params: z.object({
    title: z.string().min(1).max(80),
    tagline: z.string().max(160).optional(),
    price: z.string().max(30).optional(),
    cta: z.string().max(30).optional(),
    image: z.string().max(2048).optional(),
    site: z.string().max(60).optional(),
    logo: z.string().max(2048).optional(),
    ...themeParams,
  }),
  imageParams: ['image', 'logo'],
  example: {
    title: 'Aurora Desk Lamp',
    tagline: 'Warm light that follows the sun. Designed in Prague.',
    price: '€129',
    cta: 'Pre-order now',
    site: 'aurora.shop',
    accent: 'f59e0b',
  },
  render(p) {
    const palette = palettes[p.theme]
    return (
      <Frame palette={palette} accent={p.accent}>
        <div style={{ display: 'flex', flexGrow: 1, gap: 56 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            <Brand site={p.site} logo={p.logo} palette={palette} accent={p.accent} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  display: 'flex',
                  fontSize: fitTitle(p.title, [80, 64, 52, 44]),
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                }}
              >
                {p.title}
              </div>
              {p.tagline ? (
                <div
                  style={{ display: 'flex', fontSize: 30, color: palette.muted, lineHeight: 1.4 }}
                >
                  {p.tagline}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {p.cta ? (
                <div
                  style={{
                    display: 'flex',
                    padding: '18px 34px',
                    borderRadius: 16,
                    backgroundColor: p.accent,
                    color: '#ffffff',
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {p.cta}
                </div>
              ) : null}
              {p.price ? (
                <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>{p.price}</div>
              ) : null}
            </div>
          </div>
          {p.image ? (
            <div
              style={{
                display: 'flex',
                width: 420,
                borderRadius: 28,
                overflow: 'hidden',
                border: `1px solid ${palette.border}`,
                boxShadow: `0 30px 80px ${alpha(p.accent, 0.35)}`,
              }}
            >
              <img src={p.image} width={420} height={486} style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                width: 420,
                borderRadius: 28,
                backgroundImage: `linear-gradient(135deg, ${p.accent} 0%, ${alpha(p.accent, 0.2)} 100%)`,
                boxShadow: `0 30px 80px ${alpha(p.accent, 0.35)}`,
              }}
            />
          )}
        </div>
      </Frame>
    )
  },
})
