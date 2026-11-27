import type { ReactElement } from 'react'
import type { z } from 'zod'

export interface RenderContext {
  width: number
  height: number
}

export interface Template<S extends z.ZodObject = z.ZodObject> {
  name: string
  description: string
  params: S
  imageParams: ReadonlyArray<keyof z.infer<S> & string>
  example: Record<string, string>
  render(params: z.infer<S>, ctx: RenderContext): ReactElement
}

export function defineTemplate<S extends z.ZodObject>(template: Template<S>): Template<S> {
  return template
}
