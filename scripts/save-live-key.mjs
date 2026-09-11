import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const key = (process.env.SAKURA_API_KEY || '').trim()
if (!/^[A-Za-z0-9_-]{6,200}$/.test(key)) {
  console.error('Enter a valid IP2Location.io API key (letters, digits, underscores or hyphens).')
  process.exit(1)
}
const previous = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : ''
const retained = previous.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?(?:IP2LOCATION_API_KEY|VITE_DEMO_MODE)\s*=/.test(line))
writeFileSync('.env.local', [...retained, `IP2LOCATION_API_KEY=${key}`, 'VITE_DEMO_MODE=false', ''].join('\n'), { mode:0o600 })
console.log('Live configuration saved locally. Do not share .env.local.')
