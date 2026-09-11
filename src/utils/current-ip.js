import { canonicalIp, sameIp } from './ip-identity.js'
import { deduplicatePoints } from './point-list.js'

// Preserve endpoint configuration when the current IP already exists in the list.
export function mergeCurrentIp(points, location, newId) {
  const ip = canonicalIp(location?.ip)
  if (location?.source !== 'ip2location' || !ip) throw new Error('Current IP requires a live IP2Location result.')
  const existing = points.find(point => sameIp(point.ip, ip))
  const point = { ...existing, ...location, ip, id:existing?.id || newId,
    target:existing?.target || ip, custom:existing?.custom ?? true, isCurrentIp:true }
  const merged = points.map(item => item.id === existing?.id ? point : {...item,isCurrentIp:false})
  if (!existing) merged.push(point)
  return {...deduplicatePoints(merged), id:point.id, existed:Boolean(existing)}
}
