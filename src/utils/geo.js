const EARTH_KM = 6371

export function haversine(a, b) {
  const rad = value => (Number(value) * Math.PI) / 180
  const lat1 = rad(a.latitude)
  const lat2 = rad(b.latitude)
  const dLat = lat2 - lat1
  const dLon = rad(b.longitude) - rad(a.longitude)
  const h = Math.min(1, Math.max(0, Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2))
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function endpointScore(endpoint, client) {
  const distance = haversine(client, endpoint)
  const latency = Number(endpoint.latency ?? endpoint.demoLatency ?? 999)
  const status = endpoint.health || 'unknown'
  const healthScore = status === 'online' ? 100 : status === 'degraded' ? 52 : status === 'testing' ? 40 : 0
  const latencyScore = clamp(100 - latency / 3.5)
  const distanceScore = clamp(100 - distance / 120)
  const type = String(endpoint.usageType || endpoint.usage_type || '').toUpperCase()
  const networkScore = type.includes('DCH') || type.includes('CDN') ? 100 : type.includes('ISP') ? 82 : 68
  const score = healthScore * 0.4 + latencyScore * 0.35 + distanceScore * 0.15 + networkScore * 0.1

  return {
    ...endpoint,
    distance,
    latency,
    score,
    components: { health: healthScore, latency: latencyScore, distance: distanceScore, network: networkScore }
  }
}

export function rankEndpoints(endpoints, client) {
  return endpoints
    .map(endpoint => endpointScore(endpoint, client))
    .sort((a, b) => b.score - a.score)
    .map((endpoint, index) => ({ ...endpoint, rank: index + 1 }))
}

export function scoreLabel(score) {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

export function exportJson(client, ranked, scenario) {
  return JSON.stringify({
    generated_at: new Date().toISOString(),
    scenario,
    client: { ip: client.ip, city: client.city_name, country: client.country_name, latitude: client.latitude, longitude: client.longitude, isp: client.isp, asn: client.asn },
    recommended: ranked[0]?.id || null,
    fallback: ranked[1]?.id || null,
    endpoints: ranked.map(({ id, name, host, ip, city, country, health, latency, distance, score, rank }) => ({ id, name, host, ip, city, country, health, latency_ms: latency, distance_km: Math.round(distance), score: Number(score.toFixed(2)), rank }))
  }, null, 2)
}

export function exportCsv(ranked) {
  const rows = [['rank', 'name', 'host', 'ip', 'city', 'country', 'health', 'latency_ms', 'distance_km', 'score']]
  ranked.forEach(item => rows.push([item.rank, item.name, item.host, item.ip, item.city, item.country, item.health, item.latency, Math.round(item.distance), item.score.toFixed(2)]))
  return rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
}

export function downloadText(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function isPublicIp(value) {
  const ip = String(value || '').trim()
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) return false
  const parts = ip.split('.').map(Number)
  if (parts.some(part => part > 255)) return false
  if (parts[0] === 10 || parts[0] === 127 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)) return false
  return true
}
