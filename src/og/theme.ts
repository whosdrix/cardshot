import { z } from 'zod'

export interface Palette {
  bg: string
  fg: string
  muted: string
  subtle: string
  border: string
  surface: string
}

export const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    bg: '#09090b',
    fg: '#fafafa',
    muted: '#a1a1aa',
    subtle: '#52525b',
    border: '#27272a',
    surface: '#18181b',
  },
  light: {
    bg: '#ffffff',
    fg: '#09090b',
    muted: '#52525b',
    subtle: '#a1a1aa',
    border: '#e4e4e7',
    surface: '#f4f4f5',
  },
}

export const color = z
  .string()
  .regex(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i, 'must be a hex color like ff5a1f or #ff5a1f')
  .transform((v) => (v.startsWith('#') ? v : `#${v}`))

export const themeParams = {
  theme: z.enum(['dark', 'light']).default('dark'),
  accent: color.default('#5b8cff'),
}

export function fitTitle(text: string, sizes: [number, number, number, number]): number {
  const len = text.length
  if (len <= 32) return sizes[0]
  if (len <= 60) return sizes[1]
  if (len <= 90) return sizes[2]
  return sizes[3]
}

export function alpha(hex: string, opacity: number): string {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex
  const value = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `${full}${value}`
}
