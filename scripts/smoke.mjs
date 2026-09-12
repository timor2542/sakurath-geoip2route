import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const required = ['index.html', 'src/main.js', 'src/App.vue', 'src/components/MapCanvas.vue', 'src/components/ActivityConsole.vue', 'src/utils/activity-log.js', 'src/utils/current-ip.js', 'src/utils/ip-identity.js', 'src/utils/point-list.js', 'server/api-progress.mjs', 'server/local-geo-api.mjs', 'netlify/functions/ip.mjs', 'netlify/functions/lookup.mjs', 'scripts/rate-limit.test.mjs', '.github/workflows/ci.yml', 'README.md']
const missing = required.filter(file => !existsSync(resolve(file)))
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`)
  process.exit(1)
}

const html = readFileSync('index.html', 'utf8')
const app = readFileSync('src/App.vue', 'utf8')
const styles = readFileSync('src/styles.css', 'utf8')
const map = readFileSync('src/components/MapCanvas.vue', 'utf8')
const vite = readFileSync('vite.config.js', 'utf8')
if (!html.includes('/src/main.js') || !app.includes('MapCanvas') || !app.includes('ActivityConsole') || !app.includes('serverRanking') || !app.includes('addBulkPoints') || !app.includes('comparison-table') || !app.includes('mode-icon') || !app.includes('compare-delete-button') || !styles.includes('--accent:#f06f98') || !styles.includes('.bulk-actions') || !styles.includes('.language-slider-thumb') || !map.includes('renderRankingFeatures') || !vite.includes('localGeoApi')) {
  console.error('Application entry point validation failed.')
  process.exit(1)
}

console.log('SakuraTH GeoIP2Route smoke check passed.')
