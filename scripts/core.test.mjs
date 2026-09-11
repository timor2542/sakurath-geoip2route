import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { rankServers, csvCell } from '../src/utils/ranking.js'
import { haversine } from '../src/utils/geo.js'
import { rankingDemo } from '../src/data/rankingDemo.js'
import { inspectCsvPattern, normalizeTarget, parseTargetRecords } from '../src/utils/import.js'
import { measureEndpoint, normalizeProbeUrl, probeMatchesPoint, median } from '../src/services/probe.js'
import { geolocate } from '../netlify/functions/_shared.mjs'
import { evidenceTranslations } from '../src/data/evidenceTranslations.js'
import { formatDistance } from '../src/utils/format.js'

test('distance labels use full grouped kilometres, never compact k notation', () => {
  assert.equal(formatDistance(1426.3), '1,426 km')
  assert.equal(formatDistance(14000), '14,000 km')
  assert.equal(formatDistance(20037.4, 'th'), '20,037 กม.')
  assert.equal(formatDistance(999.6), '1,000 km')
  assert.equal(formatDistance(0), '0 km')
  assert.equal(formatDistance(0.4), '< 1 km')
  for (const invalid of [null, undefined, NaN, Infinity, -1]) assert.equal(formatDistance(invalid), '—')
})

const url = 'https://dns.google/resolve?name=example.com&type=A'
test('geo and simulated HTTP intentionally recommend different candidates', () => {
  assert.equal(rankServers(rankingDemo, 'demo-th', 'geo')[0].id, 'demo-sg')
  assert.equal(rankServers(rankingDemo, 'demo-th', 'demo')[0].id, 'demo-jp')
  const ranked = rankServers(rankingDemo, 'demo-th', 'demo')
  for (const p of ranked) assert.equal(p.score, p.components.reduce((sum, part) => sum + part.contribution, 0))
})
test('browser scoring rejects synthetic, absent, null and unavailable timings', () => {
  assert.ok(rankServers(rankingDemo, 'demo-th', 'browser').every(p => p.score === null && p.rank === null))
  const points = structuredClone(rankingDemo)
  points[1].measurement = { kind:'browser', status:'measured', latency:null }
  points[2].measurement = { kind:'browser', status:'unavailable', latency:10 }
  points[3].measurement = { kind:'browser', status:'measured', latency:65 }
  const ranked = rankServers(points, 'demo-th', 'browser')
  assert.equal(ranked[0].id, 'demo-de')
  assert.ok(ranked.slice(1).every(p => p.score === null))
})
test('HTTP scores do not change when geographic reference changes', () => {
  const points = structuredClone(rankingDemo)
  points[2].measurement.kind = 'browser'
  const score = source => rankServers(points, source, 'browser').find(p => p.id === 'demo-jp').score
  assert.equal(score('demo-th'), score('demo-de'))
  assert.deepEqual(rankServers(points, 'missing'), [])
})
test('Haversine handles identical and antipodal points', () => {
  assert.equal(haversine({latitude:0,longitude:0}, {latitude:0,longitude:0}), 0)
  assert.ok(Math.abs(haversine({latitude:0,longitude:0}, {latitude:0,longitude:180}) - Math.PI * 6371) < 1e-6)
})
test('probe validation rejects local, reserved, non-HTTPS and mismatched hosts', () => {
  for (const invalid of ['http://dns.google/', 'https://localhost/', 'https://127.0.0.1/', 'https://192.168.1.1/', 'https://192.0.2.1/', 'https://[::1]/', 'https://[2001:db8::1]/', 'https://user:secret@dns.google/', 'https://dns.google:8443/', 'https://dns.google/#fragment']) assert.throws(() => normalizeProbeUrl(invalid))
  assert.equal(normalizeProbeUrl(url), url)
  assert.ok(probeMatchesPoint({target:'dns.google',ip:'8.8.8.8'}, url))
  assert.ok(!probeMatchesPoint({target:'example.com'}, url))
  assert.ok(probeMatchesPoint({ip:'2606:4700:4700::1111'}, 'https://[2606:4700:4700::1111]/'))
})
test('median handles even, odd and empty successful samples', () => {
  assert.equal(median([]), null)
  assert.equal(median([10, 1, 4]), 4)
  assert.equal(median([10, 4]), 7)
})
test('HTTP measurement makes three explicit CORS requests and reports partial success', async () => {
  let calls = 0
  let tick = 0
  const result = await measureEndpoint({probeUrl:url}, {
    clock:() => (tick += 10),
    fetcher:async (target, options) => {
      calls++
      assert.equal(options.mode, 'cors')
      assert.equal(options.credentials, 'omit')
      assert.equal(options.redirect, 'error')
      assert.equal(new URL(target).searchParams.get('name'), 'example.com')
      assert.ok(new URL(target).searchParams.has('route_probe'))
      return {type:'cors', status:calls === 2 ? 503 : 200, ok:calls !== 2}
    }
  })
  assert.equal(calls, 3)
  assert.equal(result.successful, 2)
  assert.equal(result.latency, 10)
  assert.deepEqual(result.failures, ['http_503'])
  assert.equal(result.vantage, 'this_browser')
})
test('opaque and failed requests are unavailable, not zero latency or offline', async () => {
  const result = await measureEndpoint({probeUrl:url}, {fetcher:async () => ({type:'opaque',status:0,ok:false})})
  assert.equal(result.status, 'unavailable')
  assert.equal(result.latency, null)
  assert.equal(result.successful, 0)
  const blocked = await measureEndpoint({probeUrl:url}, {fetcher:async () => { throw new TypeError('Failed to fetch') }})
  assert.equal(blocked.failures.length, 3)
  assert.equal(blocked.latency, null)
  assert.equal('health' in blocked, false)
})
test('timeouts terminate every request with no invented timing', async () => {
  const result = await measureEndpoint({probeUrl:url}, {
    timeout:5,
    fetcher:(_, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted','AbortError'))))
  })
  assert.deepEqual(result.failures, ['timeout','timeout','timeout'])
  assert.equal(result.latency, null)
})
test('import supports IP/hostname/IPv6, BOM, headers, quotes and deduplication', () => {
  assert.equal(normalizeTarget('2606:4700:4700::1111'), '2606:4700:4700::1111')
  assert.equal(normalizeTarget('https://DNS.Google/resolve'), 'dns.google')
  assert.equal(normalizeTarget('999.1.2.3'), '')
  assert.deepEqual(parseTargetRecords('\uFEFFip\n8.8.8.8\n8.8.8.8\n1.1.1.1').map(p => p.target), ['8.8.8.8','1.1.1.1'])
  assert.equal(parseTargetRecords(`target,probe_url\n"dns.google","${url}"`)[0].probeUrl, url)
  assert.equal(parseTargetRecords('8.8.8.8; 1.1.1.1\n# comment\nexample.com').length, 3)
  assert.throws(() => parseTargetRecords(`target,probe_url\nexample.com,${url}`))
  assert.throws(() => parseTargetRecords('target,probe_url\n"dns.google,https://dns.google/'))
  assert.throws(() => parseTargetRecords(Array.from({length:201}, (_, i) => `server${i}.example.com`).join('\n')))

  const reversed = inspectCsvPattern('country_name,city_name,ip\nThailand,Bangkok,1.1.1.1')
  assert.equal(reversed.canImport, true)
  assert.equal(reversed.columns[0].role, 'countryName')
  assert.equal(reversed.columns[0].usage, 'reference')
  assert.equal(reversed.columns[2].role, 'target')
  assert.equal(reversed.recordCount, 1)
  assert.deepEqual(reversed.previewRows[0].cells, ['Thailand', 'Bangkok', '1.1.1.1'])

  const badRow = inspectCsvPattern('ip,country_name\nnot-an-ip,Thailand')
  assert.equal(badRow.canImport, false)
  assert.equal(badRow.invalidRowCount, 1)
  assert.equal(badRow.issues[0].type, 'invalid_target')
  assert.equal(badRow.previewRows[0].invalid, true)

  const missingTarget = inspectCsvPattern('country_name,city\nThailand,Bangkok')
  assert.equal(missingTarget.canImport, false)
  assert.equal(missingTarget.issues[0].type, 'missing_target_header')
  assert.equal(inspectCsvPattern('8.8.8.8\n1.1.1.1').format, 'plain')
  const metadataSample = inspectCsvPattern(readFileSync('sample-data/ip-list.csv', 'utf8'))
  assert.equal(metadataSample.canImport, true)
  assert.equal(metadataSample.recordCount, 8)
  assert.deepEqual(metadataSample.columns.map(column => column.role), ['countryName', 'city', 'target'])
})
test('CSV export neutralizes spreadsheet formulas and escapes quotes', () => {
  assert.equal(csvCell('=1+1'), '"\'=1+1"')
  assert.equal(csvCell('a"b'), '"a""b"')
  assert.equal(csvCell(null), '""')
})
test('upstream null coordinates are rejected rather than mapped to 0,0', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ok:true,json:async () => ({ip:'8.8.8.8',latitude:null,longitude:null})}))
  await assert.rejects(geolocate('8.8.8.8','test-key'), /no usable coordinates/)
})
test('disabled button CSS uses opaque light-gray backgrounds and dark-gray labels', () => {
  const css = readFileSync('src/readability.css','utf8')
  const rule = css.match(/\.app-shell button:disabled\s*\{([^}]+)\}/)?.[1]
  assert.ok(rule)
  assert.match(rule, /background:\s*#e5e7eb\s*!important/)
  assert.match(rule, /color:\s*#4b5563\s*!important/)
  assert.match(rule, /opacity:\s*1\s*;/)
  assert.match(rule, /box-shadow:\s*none\s*!important/)
  assert.match(rule, /filter:\s*none\s*!important/)
  assert.ok(css.includes('.app-shell button:disabled * { color: inherit !important; }'))
})
test('release version, language keys and demo launcher remain consistent', () => {
  const pkg = JSON.parse(readFileSync('package.json','utf8'))
  const lock = JSON.parse(readFileSync('package-lock.json','utf8'))
  assert.equal(pkg.version, lock.version)
  assert.ok(readFileSync('src/App.vue','utf8').includes(`V${pkg.version}`))
  assert.deepEqual(Object.keys(evidenceTranslations.en).sort(), Object.keys(evidenceTranslations.th).sort())
  assert.equal(evidenceTranslations.en.tryRankingDemo,'Try Demo — Simulated Data')
  assert.equal(evidenceTranslations.th.tryRankingDemo,'ลองเดโม — ข้อมูลจำลอง')
  assert.equal(evidenceTranslations.en.loadProbeExample,'Load Live Test Example')
  assert.equal(evidenceTranslations.th.loadProbeExample,'โหลดตัวอย่างทดสอบจริง')
  const app = readFileSync('src/App.vue','utf8')
  for (const kind of ['demo','live']) {
    assert.ok(app.includes(`aria-describedby="${kind}-launcher-hint"`))
    assert.ok(app.includes(`id="${kind}-launcher-hint"`))
    assert.ok(evidenceTranslations.en[`${kind}LauncherHint`])
    assert.ok(evidenceTranslations.th[`${kind}LauncherHint`])
  }
  assert.ok(!readFileSync('START-DEMO.bat','utf8').includes('> .env.local'))
})
