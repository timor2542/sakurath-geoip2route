import { sameIp } from '../utils/ip-identity.js'

// Browser HTTP response-header timing. Never ICMP, traceroute or remote-source ping.
export function normalizeProbeUrl(value) {
  const url = new URL(String(value || '').trim())
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.port) throw new Error('Use a public HTTPS URL without credentials, fragment or custom port.')
  if (!host.includes('.') && !host.includes(':')) throw new Error('Use a public hostname or IP.')
  if (/(^|\.)(localhost|local|internal|test|invalid)$/.test(host)) throw new Error('Private/local targets are not supported.')
  if (/^[\d.]+$/.test(host)) {
    const [a, b, c] = host.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113)) throw new Error('Private/reserved targets are not supported.')
  } else if (host.includes(':') && (!/^[23][\da-f]{3}:/.test(host) || host.startsWith('2001:db8:'))) {
    throw new Error('Use a global unicast IPv6 address.')
  }
  return url.href
}

export function validProbeUrl(value) {
  try { normalizeProbeUrl(value); return true } catch { return false }
}

export function probeMatchesPoint(point, value) {
  try {
    const host = new URL(normalizeProbeUrl(value)).hostname.replace(/^\[|\]$/g, '').toLowerCase()
    return [point.target, point.host, point.ip].filter(Boolean).some(item => String(item).toLowerCase().replace(/^\[|\]$/g, '') === host || sameIp(item, host))
  } catch { return false }
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  if (!sorted.length) return null
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export async function measureEndpoint(endpoint, options = {}) {
  const probeUrl = normalizeProbeUrl(endpoint.probeUrl)
  const fetcher = options.fetcher || fetch
  const clock = options.clock || (() => performance.now())
  const timeout = options.timeout || 4500
  const samples = []
  const failures = []
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const url = new URL(probeUrl)
    url.searchParams.set('route_probe', `${Date.now()}-${attempt}`)
    const start = clock()
    try {
      const response = await fetcher(url.href, {
        method: 'GET', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        redirect: 'error', cache: 'no-store', signal: controller.signal
      })
      const elapsed = Math.max(0, clock() - start)
      // Opaque responses cannot establish status, even if their fetch resolved.
      if (response.type === 'opaque' || response.type === 'opaqueredirect' || response.status === 0) failures.push('opaque')
      else if (!response.ok) failures.push(`http_${response.status}`)
      else samples.push(Math.round(elapsed * 10) / 10)
      // Only response-header timing is measured; do not download an arbitrary body.
      response.body?.cancel().catch(() => {})
    } catch (error) {
      failures.push(error.name === 'AbortError' ? 'timeout' : 'cors_network_tls_or_redirect')
    } finally { clearTimeout(timer) }
  }
  return {
    kind: 'browser', vantage: 'this_browser', probeUrl, samples, failures,
    latency: median(samples), attempts: 3, successful: samples.length,
    status: samples.length ? 'measured' : 'unavailable',
    measuredAt: new Date().toISOString()
  }
}
