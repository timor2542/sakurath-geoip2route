import dns from 'node:dns/promises'
import net from 'node:net'
import { cleanIp, geolocate, isPublicAddress } from '../netlify/functions/_shared.mjs'
import { normalizeTarget } from '../src/utils/import.js'
import { createApiProgress } from './api-progress.mjs'

// Exported handler can be tested without opening ports or calling real providers.
export function createLocalGeoHandler({ key, progress = createApiProgress(), fetcher = fetch, resolve = dns.lookup, locate = geolocate } = {}) {
  return async (request, response, next) => {
    const url = new URL(request.url || '/', 'http://localhost')
    if (!['/.netlify/functions/ip', '/.netlify/functions/lookup'].includes(url.pathname)) return next()
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    if (request.method !== 'GET') { response.statusCode = 405; response.end(JSON.stringify({error:'Method not allowed'})); return }
    const current = url.pathname.endsWith('/ip')
    const task = progress.begin(current ? 'current' : 'lookup')
    try {
      if (!key) throw new Error('IP2LOCATION_API_KEY is missing. Run START-LIVE.bat and paste your key.')
      let ip
      let host = ''
      let detectionSource
      if (current) {
        // Never trust arbitrary forwarded headers on a development server.
        const peer = cleanIp(request.socket?.remoteAddress || '')
        if (isPublicAddress(peer)) { ip = peer; detectionSource = 'direct_connection' }
        else if (peer === '127.0.0.1') {
          const result = await fetcher('https://ip.ip2location.io/', {headers:{accept:'text/plain'}, signal:AbortSignal.timeout(5000)})
          ip = (await result.text()).trim()
          if (!result.ok || !isPublicAddress(ip)) throw new Error('Could not detect the development computer public IP.')
          detectionSource = 'development_host'
        } else {
          throw new Error('Current IP detection is unavailable through this LAN/private proxy. Open the app on the development computer, or add a public IP manually.')
        }
      } else {
        const target = normalizeTarget(url.searchParams.get('target'))
        if (!target) throw new Error('Enter a valid public IP address or hostname.')
        host = net.isIP(target) ? '' : target
        ip = host ? (await resolve(host)).address : target
      }
      if (!isPublicAddress(ip)) throw new Error('A public IP address is required.')
      task.resolved()
      const location = await locate(ip, key)
      task.fetched()
      response.statusCode = 200
      response.end(JSON.stringify({...location, ...(current ? {detection_source:detectionSource} : {host,resolved_ip:ip})}))
      task.end(true)
    } catch (error) {
      response.statusCode = 502
      response.end(JSON.stringify({error:error.message || 'GeoIP request failed'}))
      task.end(false)
    }
  }
}

export function localGeoApi(key) {
  return {
    name:'sakurath-local-geo-api',
    configureServer(server) {
      const progress = createApiProgress()
      server.middlewares.use(createLocalGeoHandler({key, progress}))
      server.httpServer?.once('close', () => progress.close())
    }
  }
}
