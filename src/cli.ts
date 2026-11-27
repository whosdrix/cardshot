#!/usr/bin/env node
import { loadConfig } from './config.js'
import { signUrl } from './lib/signing.js'
import { startServer } from './server.js'

const [command, ...args] = process.argv.slice(2)

const usage = `Usage:
  cardshot serve              Start the server (reads config from env)
  cardshot sign <url>         Print a signed URL (needs SIGNING_SECRET)
`

if (command === 'serve' || command === undefined) {
  await startServer(loadConfig())
} else if (command === 'sign') {
  const secret = process.env.SIGNING_SECRET
  const url = args[0]
  if (!secret || !url) {
    console.error(usage)
    process.exit(1)
  }
  console.log(signUrl(url, secret))
} else {
  console.error(usage)
  process.exit(1)
}
