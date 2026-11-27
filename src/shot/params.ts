import { z } from 'zod'
import { qbool } from '../lib/query.js'

const selector = z.string().trim().min(1).max(300)

export const shotParams = z
  .object({
    url: z.string().min(1, 'url is required').max(2048),
    width: z.coerce.number().int().min(320).max(3840).default(1280),
    height: z.coerce.number().int().min(240).max(2160).default(800),
    scale: z.coerce.number().min(1).max(3).default(1),
    fullPage: qbool.default(false),
    dark: qbool.default(false),
    format: z.enum(['png', 'jpeg']).default('png'),
    quality: z.coerce.number().int().min(1).max(100).default(85),
    selector: selector.optional(),
    waitFor: selector.optional(),
    delay: z.coerce.number().int().min(0).max(10_000).default(0),
    hide: z
      .string()
      .max(1000)
      .optional()
      .transform((v) =>
        v
          ? v
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      ),
    clean: qbool.default(true),
  })
  .strict()

export type ShotParams = z.infer<typeof shotParams>
