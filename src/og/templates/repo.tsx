import { z } from 'zod'
import { defineTemplate } from '../template.js'
import { fitTitle, palettes, themeParams } from '../theme.js'
import { Avatar, Frame } from './parts.js'

const count = z
  .string()
  .max(12)
  .optional()
  .transform((v) => {
    if (!v) return undefined
    const n = Number(v)
    if (!Number.isFinite(n)) return v
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
    return String(n)
  })

function StarIcon(props: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 16 16" fill={props.color}>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

function ForkIcon(props: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 16 16" fill={props.color}>
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
    </svg>
  )
}

export const repo = defineTemplate({
  name: 'repo',
  description: 'A repository card with owner, description, language and stats.',
  params: z.object({
    owner: z.string().min(1).max(60),
    name: z.string().min(1).max(80),
    description: z.string().max(220).optional(),
    language: z.string().max(30).optional(),
    languageColor: z
      .string()
      .regex(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
      .transform((v) => (v.startsWith('#') ? v : `#${v}`))
      .optional(),
    stars: count,
    forks: count,
    avatar: z.string().max(2048).optional(),
    ...themeParams,
  }),
  imageParams: ['avatar'],
  example: {
    owner: 'whosdrix',
    name: 'cardshot',
    description: 'Self-hosted OG images and website screenshots. One container, two endpoints.',
    language: 'TypeScript',
    languageColor: '3178c6',
    stars: '1280',
    forks: '64',
  },
  render(p) {
    const palette = palettes[p.theme]
    const stat = { display: 'flex', alignItems: 'center', gap: 12 } as const
    return (
      <Frame palette={palette} accent={p.accent}>
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', gap: 48 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              gap: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: fitTitle(`${p.owner}/${p.name}`, [76, 64, 52, 44]),
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              <span style={{ color: palette.muted, fontWeight: 400 }}>{p.owner}/</span>
              <span style={{ fontWeight: 800 }}>{p.name}</span>
            </div>
            {p.description ? (
              <div style={{ display: 'flex', fontSize: 32, color: palette.muted, lineHeight: 1.4 }}>
                {p.description}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Avatar src={p.avatar} name={p.owner} size={160} accent={p.accent} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 48, fontSize: 30, color: palette.muted }}>
          {p.language ? (
            <div style={stat}>
              <div
                style={{
                  display: 'flex',
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  backgroundColor: p.languageColor ?? p.accent,
                }}
              />
              {p.language}
            </div>
          ) : null}
          {p.stars ? (
            <div style={stat}>
              <StarIcon color={palette.muted} />
              {p.stars}
            </div>
          ) : null}
          {p.forks ? (
            <div style={stat}>
              <ForkIcon color={palette.muted} />
              {p.forks}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 12,
            backgroundColor: p.languageColor ?? p.accent,
          }}
        />
      </Frame>
    )
  },
})
