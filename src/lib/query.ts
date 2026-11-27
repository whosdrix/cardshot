import { z } from 'zod'

export const qbool = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0', 'yes', 'no', ''])])
  .transform((v) => v === true || v === 'true' || v === '1' || v === 'yes' || v === '')

export function queryObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of params) {
    if (key !== 'sig') out[key] = value
  }
  return out
}
