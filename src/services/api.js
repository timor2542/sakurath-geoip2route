import { canonicalIp } from '../utils/ip-identity.js'

async function fetchJson(url, options = {}, timeout = 5500) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const data = await response.json().catch(() => {
      if (response.status === 429) throw new Error('Too many GeoIP requests. Wait one minute and try again.')
      throw new Error('The GeoIP service did not return JSON. Start the Vite server or configure Netlify Functions.')
    })
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('GeoIP request timed out. Please try again.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function getCurrentLocation() {
  // This button must never substitute a bundled example for the user's IP.
  return validateLocation(await fetchJson('/.netlify/functions/ip', {}, 12000))
}

function validateLocation(data) {
  const ip = canonicalIp(data?.ip)
  if (!ip || typeof data.latitude !== 'number' || typeof data.longitude !== 'number' || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude) || Math.abs(data.latitude) > 90 || Math.abs(data.longitude) > 180) {
    throw new Error('The GeoIP service returned no usable coordinates for this IP.')
  }
  return {...data, ip}
}

export async function lookupTarget(target) {
  return validateLocation(await fetchJson(`/.netlify/functions/lookup?target=${encodeURIComponent(target)}`))
}
