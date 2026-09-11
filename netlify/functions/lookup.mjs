import dns from 'node:dns/promises'
import net from 'node:net'
import { geolocate, isPublicAddress, reply } from './_shared.mjs'
import { createApiProgress } from '../../server/api-progress.mjs'

export const config = {
  path: '/.netlify/functions/lookup',
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain']
  }
}

function normalizeTarget(value = '') {
  const trimmed = String(value).trim().toLowerCase()
  if (net.isIP(trimmed)) return trimmed
  const host = trimmed.replace(/^https?:\/\//, '').split('/')[0].split(':')[0]
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)) return ''
  return host
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return reply(204, {})
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Method not allowed' })
  const target = normalizeTarget(event.queryStringParameters?.target)
  if (!target) return reply(400, { error: 'Enter a valid public IPv4, IPv6 address, or hostname.' })

  const task = createApiProgress().begin('lookup')
  try {
    const host = net.isIP(target) ? null : target
    const ip = host ? (await dns.lookup(host, { family: 0 })).address : target
    if (!isPublicAddress(ip)) { task.end(false); return reply(400, { error: 'Private and reserved addresses are not supported.' }) }
    task.resolved()
    const location = await geolocate(ip)
    task.fetched()
    task.end(true)
    return reply(200, { ...location, host: host || '', resolved_ip: ip })
  } catch (error) {
    task.end(false)
    return reply(502, { error: error.code === 'ENOTFOUND' ? 'Hostname could not be resolved.' : error.message })
  }
}
