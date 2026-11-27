import type { ReactNode } from 'react'
import { alpha, type Palette } from '../theme.js'

export function Frame(props: {
  palette: Palette
  accent: string
  padding?: number
  children: ReactNode
}) {
  const { palette, accent, padding = 72 } = props
  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding,
        backgroundColor: palette.bg,
        backgroundImage: `radial-gradient(circle at 100% 0%, ${alpha(accent, 0.28)} 0%, ${alpha(accent, 0)} 55%), radial-gradient(circle at 0% 100%, ${alpha(accent, 0.12)} 0%, ${alpha(accent, 0)} 45%)`,
        color: palette.fg,
        fontFamily: 'Inter',
      }}
    >
      {props.children}
    </div>
  )
}

export function Brand(props: { site?: string; logo?: string; palette: Palette; accent: string }) {
  if (!props.site && !props.logo) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {props.logo ? (
        <img
          src={props.logo}
          width={44}
          height={44}
          style={{ borderRadius: 10, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: props.accent,
          }}
        />
      )}
      {props.site ? (
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: props.palette.muted }}>
          {props.site}
        </div>
      ) : null}
    </div>
  )
}

export function Avatar(props: { src?: string; name: string; size: number; accent: string }) {
  if (props.src) {
    return (
      <img
        src={props.src}
        width={props.size}
        height={props.size}
        style={{ borderRadius: 999, objectFit: 'cover' }}
      />
    )
  }
  const initials = props.name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: props.size,
        height: props.size,
        borderRadius: 999,
        backgroundColor: props.accent,
        color: '#ffffff',
        fontSize: props.size * 0.4,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  )
}

export function Dot(props: { color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: props.color,
        margin: '0 4px',
      }}
    />
  )
}
