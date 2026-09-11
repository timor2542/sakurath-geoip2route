import { canonicalIp } from './ip-identity.js'

// Keep stable first-seen IDs and an explicit old-ID -> surviving-ID mapping.
// A configured probe and its hostname/timing stay together during a collision.
export function deduplicatePoints(points) {
  const unique = new Map()
  const idMap = new Map()
  for (const item of points) {
    const ip = canonicalIp(item.ip)
    const key = ip || `invalid:${item.id}`
    const first = unique.get(key)
    const point = {...item, ...(ip ? {ip} : {})}
    if (!first) {
      unique.set(key, point)
      idMap.set(item.id, item.id)
      continue
    }
    // Prefer live geography to bundled samples; otherwise first record wins.
    const geography = first.source === 'ip2location' || point.source !== 'ip2location' ? first : point
    const configuration = first.probeUrl ? first : point.probeUrl ? point : first
    unique.set(key, {...point, ...first, ...geography, id:first.id,
      target:configuration.target, host:configuration.host,
      probeUrl:configuration.probeUrl, measurement:configuration.measurement,
      isCurrentIp:Boolean(first.isCurrentIp || point.isCurrentIp)})
    idMap.set(item.id, first.id)
  }
  return {points:[...unique.values()], idMap, mergedCount:points.length - unique.size}
}

export function remapPointSelection({points,idMap}, selection) {
  const ids = new Set(points.map(point => point.id))
  const remap = id => {
    const mapped = idMap.get(id) || id
    return ids.has(mapped) ? mapped : ''
  }
  const rankingSourceId = remap(selection.rankingSourceId) || points[0]?.id || ''
  const candidate = remap(selection.selectedServerId)
  return {
    selectedCompareIds:[...new Set(selection.selectedCompareIds.map(remap).filter(Boolean))].slice(0,2),
    rankingSourceId,
    selectedServerId:candidate && candidate !== rankingSourceId ? candidate : points.find(point => point.id !== rankingSourceId)?.id || ''
  }
}
