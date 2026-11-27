import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import type { Font } from 'satori'

const require = createRequire(import.meta.url)

const FILES: Array<{ name: string; pkg: string; weight: Font['weight'] }> = [
  { name: 'Inter', pkg: 'inter', weight: 400 },
  { name: 'Inter', pkg: 'inter', weight: 600 },
  { name: 'Inter', pkg: 'inter', weight: 700 },
  { name: 'Inter', pkg: 'inter', weight: 800 },
  { name: 'JetBrains Mono', pkg: 'jetbrains-mono', weight: 400 },
  { name: 'JetBrains Mono', pkg: 'jetbrains-mono', weight: 500 },
]

let loaded: Promise<Font[]> | undefined

export function loadFonts(): Promise<Font[]> {
  loaded ??= Promise.all(
    FILES.flatMap(({ name, pkg, weight }) =>
      ['latin', 'latin-ext'].map(async (subset) => ({
        name: subset === 'latin' ? name : `${name} Ext`,
        weight,
        style: 'normal' as const,
        data: await readFile(
          require.resolve(`@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-normal.woff`),
        ),
      })),
    ),
  )
  return loaded
}
