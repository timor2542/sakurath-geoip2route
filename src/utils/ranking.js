import { haversine, clamp } from './geo.js'

export function rankServers(points, sourceId, basis = 'geo') {
  const source = points.find(point => point.id === sourceId)
  if (!source) return []
  return points.filter(point => point.id !== sourceId && (basis !== 'demo' || point.demoGroup))
    .map(point => {
      const distance = haversine(source, point)
      const distanceScore = clamp(100 - distance / 200.37)
      const type = String(point.usage_type || '').toUpperCase()
      // Product preference for server-like networks, not a performance fact.
      const networkScore = /DCH|CDN/.test(type) ? 100 : type.includes('ISP') ? 82 : type.includes('MOB') ? 70 : 76
      const evidence = point.measurement
      const expectedKind = basis === 'demo' ? 'simulated' : 'browser'
      const latencyMeasured = evidence?.kind === expectedKind && evidence.status === 'measured' && typeof evidence.latency === 'number' && Number.isFinite(evidence.latency) && evidence.latency >= 0
      const latencySignalScore = latencyMeasured ? clamp(100 - evidence.latency / 4) : null
      const eligible = basis === 'geo' ? Number.isFinite(distance) : latencyMeasured
      const mainScore = basis === 'geo' ? distanceScore : latencySignalScore
      const score = eligible ? mainScore * 0.8 + networkScore * 0.2 : null
      return { ...point, distance, distanceScore, networkScore, latencySignalScore,
        latencyMeasured, latency: latencyMeasured ? evidence.latency : null, eligible, score,
        components: [{ key: basis === 'geo' ? 'distance' : 'latency', weight: 0.8, value: mainScore, contribution: eligible ? mainScore * 0.8 : null },
          { key: 'network', weight: 0.2, value: networkScore, contribution: eligible ? networkScore * 0.2 : null }] }
    })
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || (b.score ?? 0) - (a.score ?? 0) || String(a.id).localeCompare(String(b.id)))
    .map((point, index) => ({ ...point, rank: point.eligible ? index + 1 : null }))
}

export function csvCell(value) {
  let text = String(value ?? '')
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
