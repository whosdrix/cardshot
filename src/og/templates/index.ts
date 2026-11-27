import type { Template } from '../template.js'
import { basic } from './basic.js'
import { blog } from './blog.js'
import { product } from './product.js'
import { quote } from './quote.js'
import { repo } from './repo.js'

export const templates: Record<string, Template> = Object.fromEntries(
  ([basic, blog, repo, product, quote] as unknown as Template[]).map((t) => [t.name, t]),
)
