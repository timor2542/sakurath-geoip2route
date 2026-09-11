import { cleanIp, geolocate, isPublicAddress, reply } from './_shared.mjs'
import { createApiProgress } from '../../server/api-progress.mjs'

export const config = {
  path: '/.netlify/functions/ip',
  rateLimit: {
    windowLimit: 20,
    windowSize: 60,
    aggregateBy: ['ip', 'domain']
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return reply(204, {})
  if (event.httpMethod !== 'GET') return reply(405, { error: 'Method not allowed' })

  const task = createApiProgress().begin('current')
  const clientIp = cleanIp(event.headers?.['x-nf-client-connection-ip'] || '')

  if (!isPublicAddress(clientIp)) {
    task.end(false)
    return reply(400, { error: 'A public connection IP was not available. Use npm run dev locally or add a public IP manually.' })
  }

  try {
    task.resolved()
    const location = await geolocate(clientIp)
    task.fetched()
    const response = reply(200, {...location, detection_source:'netlify_connection'})
    task.end(true)
    return response
  } catch (error) {
    task.end(false)
    return reply(502, { error: error.message })
  }
}
