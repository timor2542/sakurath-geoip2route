import net from 'node:net'

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'access-control-allow-origin': '*'
}

const GEO_CACHE_TTL_MS = 15 * 60 * 1000
const GEO_CACHE_MAX_ENTRIES = 500
const geolocationCache = new Map()

export function reply(statusCode, body, extraHeaders = {}) {
  return { statusCode, headers: {...jsonHeaders, ...extraHeaders}, body: JSON.stringify(body) }
}

export function clearGeolocationCache() {
  geolocationCache.clear()
}

function cachedLocation(ip, now) {
  const entry = geolocationCache.get(String(ip).toLowerCase())
  if (!entry) return null
  if (entry.expiresAt <= now) {
    geolocationCache.delete(String(ip).toLowerCase())
    return null
  }
  return {...entry.value}
}

function rememberLocation(ip, value, now) {
  const cacheKey = String(ip).toLowerCase()
  if (geolocationCache.size >= GEO_CACHE_MAX_ENTRIES && !geolocationCache.has(cacheKey)) {
    geolocationCache.delete(geolocationCache.keys().next().value)
  }
  geolocationCache.set(cacheKey, {expiresAt:now + GEO_CACHE_TTL_MS, value:{...value}})
}

export function cleanIp(value = '') {
  const first = String(value).split(',')[0].trim().replace(/^::ffff:/, '')
  return first === '::1' ? '127.0.0.1' : first
}

export function isPublicAddress(ip) {
  if (!net.isIP(ip || '')) return false
  if (ip.includes(':')) return /^[23][\da-f]{3}:/i.test(ip) && !/^2001:db8:/i.test(ip)
  const [a, b, c] = ip.split('.').map(Number)
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113))
}

export async function geolocate(ip, key = process.env.IP2LOCATION_API_KEY, {fetcher = fetch, now = Date.now()} = {}) {
  if (!isPublicAddress(ip)) throw new Error('A public IP address is required; private and documentation addresses are not supported.')
  if (!key) throw new Error('IP2LOCATION_API_KEY is not configured')
  const cached = cachedLocation(ip, now)
  if (cached) return cached
  const url = new URL('https://api.ip2location.io/')
  url.searchParams.set('key', key)
  url.searchParams.set('ip', ip)
  const response = await fetcher(url, { headers: { accept: 'application/json' }, signal:AbortSignal.timeout(5000) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.error) throw new Error(data.error?.error_message || data.error || `IP2Location lookup failed (${response.status})`)
  const validCoordinate = (value, max) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= max
  if (!validCoordinate(data.latitude, 90) || !validCoordinate(data.longitude, 180)) throw new Error('IP2Location returned no usable coordinates for this address.')
  const location = {
    ip: data.ip || ip,
    country_code: data.country_code || '',
    country_name: data.country_name || '',
    region_name: data.region_name || '',
    city_name: data.city_name || '',
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    zip_code: data.zip_code || '',
    time_zone: data.time_zone || '',
    asn: data.asn || '',
    as: data.as || data.as_name || '',
    isp: data.isp || '',
    domain: data.domain || '',
    usage_type: data.usage_type || '',
    source: 'ip2location'
  }
  rememberLocation(ip, location, now)
  return {...location}
}
