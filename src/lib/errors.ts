import type { z } from 'zod'

export class HttpError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 422 | 500 | 502 | 504,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
  }
}

export function fromZod(error: z.ZodError): HttpError {
  return new HttpError(
    400,
    'Invalid parameters',
    error.issues.map((issue) => ({
      param: 'keys' in issue ? issue.keys.join(', ') : issue.path.join('.'),
      message: issue.message,
    })),
  )
}
