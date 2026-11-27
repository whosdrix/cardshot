import { z } from 'zod'
import { defineTemplate } from '../template.js'
import { alpha, fitTitle, palettes, themeParams } from '../theme.js'
import { Avatar, Brand, Dot, Frame } from './parts.js'

export const blog = defineTemplate({
  name: 'blog',
  description: 'An article card with tags, author, date and reading time.',
  params: z.object({
    title: z.string().min(1).max(160),
    author: z.string().max(60).optional(),
    avatar: z.string().max(2048).optional(),
    date: z.string().max(40).optional(),
    readingTime: z.string().max(30).optional(),
    tags: z
      .string()
      .max(120)
      .optional()
      .transform((v) =>
        v
          ? v
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 4)
          : [],
      ),
    site: z.string().max(60).optional(),
    logo: z.string().max(2048).optional(),
    ...themeParams,
  }),
  imageParams: ['avatar', 'logo'],
  example: {
    title: 'Designing OG images that people actually click',
    author: 'Jane Doe',
    date: 'Nov 27, 2026',
    readingTime: '6 min read',
    tags: 'design,seo',
    site: 'blog.example.com',
  },
  render(p) {
    const palette = palettes[p.theme]
    const meta = [p.date, p.readingTime].filter(Boolean) as string[]
    return (
      <Frame palette={palette} accent={p.accent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {p.tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: `2px solid ${alpha(p.accent, 0.5)}`,
                  backgroundColor: alpha(p.accent, 0.12),
                  color: p.accent,
                  fontSize: 22,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <Brand site={p.site} logo={p.logo} palette={palette} accent={p.accent} />
        </div>
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              fontSize: fitTitle(p.title, [80, 68, 56, 46]),
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
            }}
          >
            {p.title}
          </div>
        </div>
        {p.author || meta.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {p.author ? (
              <Avatar src={p.avatar} name={p.author} size={64} accent={p.accent} />
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28 }}>
              {p.author ? <div style={{ display: 'flex', fontWeight: 600 }}>{p.author}</div> : null}
              {meta.map((item, i) => (
                <div
                  key={item}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, color: palette.muted }}
                >
                  {p.author || i > 0 ? <Dot color={palette.subtle} /> : null}
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Frame>
    )
  },
})
