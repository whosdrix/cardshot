import { z } from 'zod'

const bool = z
  .enum(['true', 'false', '1', '0', ''])
  .optional()
  .transform((v) => v === 'true' || v === '1')

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  SIGNING_SECRET: z.string().optional().default(''),
  CACHE_DIR: z.string().default('.cache'),
  CACHE_TTL: z.coerce.number().int().nonnegative().default(604_800),
  CACHE_MAX_AGE: z.coerce.number().int().nonnegative().default(86_400),
  SHOT_CONCURRENCY: z.coerce.number().int().positive().default(2),
  SHOT_TIMEOUT: z.coerce.number().int().positive().default(15_000),
  ALLOW_PRIVATE_URLS: bool,
  CHROMIUM_PATH: z.string().optional().default(''),
})

export interface Config {
  port: number
  host: string
  signingSecret: string
  cacheDir: string
  cacheTtl: number
  cacheMaxAge: number
  shotConcurrency: number
  shotTimeout: number
  allowPrivateUrls: boolean
  chromiumPath: string
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const e = schema.parse(env)
  return {
    port: e.PORT,
    host: e.HOST,
    signingSecret: e.SIGNING_SECRET,
    cacheDir: e.CACHE_DIR,
    cacheTtl: e.CACHE_TTL,
    cacheMaxAge: e.CACHE_MAX_AGE,
    shotConcurrency: e.SHOT_CONCURRENCY,
    shotTimeout: e.SHOT_TIMEOUT,
    allowPrivateUrls: e.ALLOW_PRIVATE_URLS,
    chromiumPath: e.CHROMIUM_PATH,
  }
}
