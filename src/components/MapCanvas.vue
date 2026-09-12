<template>
  <div class="map-shell" :class="{ 'dark-map': theme === 'dark' }">
    <div ref="mapElement" class="map" role="region" :aria-label="labels.map"></div>
    <div class="map-toolbar" role="group" :aria-label="labels.zoomControls">
      <button type="button" @click="zoomIn" :aria-label="labels.zoomIn" :title="labels.zoomIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <button type="button" @click="zoomOut" :aria-label="labels.zoomOut" :title="labels.zoomOut">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>
      </button>
      <span class="map-toolbar-divider" aria-hidden="true"></span>
      <button class="map-fit-button" type="button" @click="resetMapView" :aria-label="labels.resetZoom" :title="labels.resetZoom">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg>
      </button>
    </div>
    <div class="map-legend" aria-hidden="true">
      <template v-if="mode === 'compare'">
        <span><i class="legend-dot point-a"></i>{{ labels.pointA }}</span>
        <span><i class="legend-dot point-b"></i>{{ labels.pointB }}</span>
        <span><i class="legend-dot other"></i>{{ labels.other }}</span>
      </template>
      <template v-else-if="mode === 'ranking'">
        <span><i class="legend-dot client"></i>{{ labels.source }}</span>
        <span><i class="legend-dot recommended"></i>{{ labels.bestServer }}</span>
        <span><i class="legend-dot other"></i>{{ labels.otherServers }}</span>
        <span>{{ labels.referenceOnly }}</span>
      </template>
      <template v-else>
        <span><i class="legend-dot client"></i>{{ labels.client }}</span>
        <span><i class="legend-dot recommended"></i>{{ labels.recommended }}</span>
        <span><i class="legend-dot fallback"></i>{{ labels.fallback }}</span>
        <span><i class="legend-dot other"></i>{{ labels.other }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  client: { type: Object, required: true },
  endpoints: { type: Array, default: () => [] },
  mode: { type: String, default: 'route' },
  comparePoints: { type: Array, default: () => [] },
  selectedCompareIds: { type: Array, default: () => [] },
  rankingPoints: { type: Array, default: () => [] },
  rankingSourceId: { type: String, default: '' },
  selectedServerId: { type: String, default: '' },
  theme: { type: String, default: 'light' },
  labels: { type: Object, required: true }
})

const emit = defineEmits(['select', 'select-compare', 'select-server'])
const mapElement = ref(null)
let map
let tileLayer
let featureLayer
let graticuleLayer
let scaleControl
let boundsSignature = ''
let visibleBounds = []
let resizeObserver

function tooltip(...lines) {
  const root = document.createElement('div')
  root.className = 'ip-tooltip-content'
  lines.forEach((text, index) => {
    const line = document.createElement(index ? 'div' : 'strong')
    if (index === 1) line.className = 'ip-text'
    line.textContent = String(text ?? '')
    root.appendChild(line)
  })
  return root
}

const ipTooltipOptions = { direction:'top', className:'ip-map-tooltip' }

function fitVisibleBounds(bounds) {
  visibleBounds = bounds.map(point => [...point])
  const signature = JSON.stringify([props.mode, props.rankingSourceId, bounds])
  if (signature === boundsSignature) return
  boundsSignature = signature
  const width = map.getSize().x
  const sidePadding = width > 700 ? 72 : width > 420 ? 44 : 28
  const topPadding = width > 420 ? 64 : 58
  const bottomPadding = width > 420 ? 78 : 66
  if (bounds.length > 1) map.fitBounds(bounds, { paddingTopLeft:[sidePadding,topPadding], paddingBottomRight:[sidePadding,bottomPadding], maxZoom:5, animate:false })
  else if (bounds.length) map.setView(bounds[0], 7, { animate:false })
  else map.setView([18,20], 2, { animate:false })
}

function zoomIn() { map?.zoomIn() }
function zoomOut() { map?.zoomOut() }

function niceMetricDistance(metersAtTarget) {
  const exponent = Math.floor(Math.log10(Math.max(metersAtTarget, 1)))
  const candidates = []
  for (let power = exponent - 1; power <= exponent + 1; power += 1) {
    for (const multiplier of [1, 2, 5]) candidates.push(multiplier * (10 ** power))
  }
  return candidates.reduce((best, value) => (
    Math.abs(Math.log(value / metersAtTarget)) < Math.abs(Math.log(best / metersAtTarget)) ? value : best
  ))
}

function metricGridMeasurement() {
  const size = map.getSize()
  const targetPixels = Math.min(144, Math.max(104, size.x / 7))
  const center = size.divideBy(2)
  const west = map.containerPointToLatLng([center.x - targetPixels / 2, center.y])
  const east = map.containerPointToLatLng([center.x + targetPixels / 2, center.y])
  const metersAtTarget = map.distance(west, east)
  const meters = niceMetricDistance(metersAtTarget)
  return { meters, pixels: targetPixels * meters / metersAtTarget }
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

function formatGridDistance(meters) {
  if (meters >= 1000) return `${Math.round(meters / 1000).toLocaleString()} km`
  return `${Math.round(meters).toLocaleString()} m`
}

function updateGridScale(measurement) {
  const container = scaleControl?.getContainer()
  if (!container) return
  container.style.setProperty('--grid-scale-width', `${measurement.pixels}px`)
  const value = container.querySelector('.metric-grid-scale-value')
  if (value) value.textContent = `≈ ${formatGridDistance(measurement.meters)}`
  const accessibleLabel = `${props.labels.mapScale}: ${props.labels.gridCell} ${formatGridDistance(measurement.meters)}`
  container.setAttribute('aria-label', accessibleLabel)
  container.setAttribute('title', accessibleLabel)
}

function renderMetricGrid() {
  if (!map || map.getZoom() === undefined) return
  graticuleLayer?.remove()
  graticuleLayer = L.layerGroup().addTo(map)
  const size = map.getSize()
  const measurement = metricGridMeasurement()
  const step = measurement.pixels
  const origin = map.latLngToContainerPoint([0, 0])
  const startX = positiveModulo(origin.x, step)
  const startY = positiveModulo(origin.y, step)
  const color = props.theme === 'dark' ? '#ffb0c7' : '#c74270'
  const style = { pane:'graticulePane', interactive:false, color, weight:1, opacity:.28, dashArray:'5 9' }
  for (let x = startX; x <= size.x; x += step) {
    L.polyline([
      map.containerPointToLatLng([x, 0]),
      map.containerPointToLatLng([x, size.y])
    ], style).addTo(graticuleLayer)
  }
  for (let y = startY; y <= size.y; y += step) {
    L.polyline([
      map.containerPointToLatLng([0, y]),
      map.containerPointToLatLng([size.x, y])
    ], style).addTo(graticuleLayer)
  }
  updateGridScale(measurement)
}

function updateScaleControlLabel() {
  if (map) renderMetricGrid()
}
function resetMapView() {
  if (!map) return
  boundsSignature = ''
  fitVisibleBounds(visibleBounds)
}

const tiles = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

function pointIcon(className, label) {
  const wideClass = String(label).length > 2 ? ' map-pin-label-wide' : ''
  return L.divIcon({
    className: '',
    html: `<span class="map-pin ${className}"><b class="${wideClass.trim()}">${label}</b></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  })
}

function accessibleMarker(coordinates, options, label) {
  const marker = L.marker(coordinates, { ...options, keyboard:true })
  marker.on('add', () => marker.getElement()?.setAttribute('aria-label', label))
  return marker
}

function setTiles() {
  if (!map) return
  if (tileLayer) tileLayer.remove()
  tileLayer = L.tileLayer(tiles[props.theme] || tiles.light, {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
}

function renderFeatures() {
  if (!map || !props.client) return
  if (featureLayer) featureLayer.remove()
  featureLayer = L.layerGroup().addTo(map)
  if (props.mode === 'compare') {
    renderComparisonFeatures()
    return
  }
  if (props.mode === 'ranking') {
    renderRankingFeatures()
    return
  }
  const points = []
  const clientPoint = [Number(props.client.latitude), Number(props.client.longitude)]
  points.push(clientPoint)

  accessibleMarker(clientPoint, { icon: pointIcon('client-pin', 'YOU'), zIndexOffset: 900 }, [props.labels.client, props.client.city_name || props.client.region_name, props.client.ip].filter(Boolean).join(' · '))
    .bindTooltip(tooltip(props.client.city_name || props.client.region_name || 'Client', props.client.ip), ipTooltipOptions)
    .addTo(featureLayer)

  props.endpoints.forEach(endpoint => {
    const point = [Number(endpoint.latitude), Number(endpoint.longitude)]
    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return
    points.push(point)
    const className = endpoint.rank === 1 ? 'recommended-pin' : endpoint.rank === 2 ? 'fallback-pin' : endpoint.health === 'offline' ? 'offline-pin' : 'endpoint-pin'
    const color = endpoint.rank === 1 ? '#f06f98' : endpoint.rank === 2 ? '#ffc857' : endpoint.health === 'offline' ? '#ff5f67' : '#8da4ac'
    const dashArray = endpoint.rank <= 2 ? null : '4 8'

    L.polyline([clientPoint, point], { color, weight: endpoint.rank === 1 ? 3 : 1.6, opacity: endpoint.rank <= 2 ? 0.86 : 0.54, dashArray })
      .addTo(featureLayer)

    accessibleMarker(point, { icon: pointIcon(className, String(endpoint.rank)), zIndexOffset: 800 - endpoint.rank }, [`#${endpoint.rank}`, endpoint.name, endpoint.ip].filter(Boolean).join(' · '))
      .bindTooltip(tooltip(endpoint.name, endpoint.ip, `${Math.round(endpoint.distance).toLocaleString()} km · ${endpoint.latency} ms`), ipTooltipOptions)
      .on('click', () => emit('select', endpoint.id))
      .addTo(featureLayer)
  })

  fitVisibleBounds(points)
}

function renderComparisonFeatures() {
  const bounds = []
  const pointA = props.comparePoints.find(point => point.id === props.selectedCompareIds[0])
  const pointB = props.comparePoints.find(point => point.id === props.selectedCompareIds[1])

  if (pointA && pointB) {
    L.polyline(
      [[Number(pointA.latitude), Number(pointA.longitude)], [Number(pointB.latitude), Number(pointB.longitude)]],
      { color: '#f06f98', weight: 4, opacity: 0.9, dashArray: '10 8' }
    ).addTo(featureLayer)
  }

  props.comparePoints.forEach((point, index) => {
    const coordinates = [Number(point.latitude), Number(point.longitude)]
    if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return
    bounds.push(coordinates)
    const selectedIndex = props.selectedCompareIds.indexOf(point.id)
    const markerClass = selectedIndex === 0 ? 'compare-a-pin' : selectedIndex === 1 ? 'compare-b-pin' : 'compare-pin'
    const markerLabel = selectedIndex === 0 ? 'A' : selectedIndex === 1 ? 'B' : String(index + 1)
    accessibleMarker(coordinates, { icon: pointIcon(markerClass, markerLabel), zIndexOffset: selectedIndex >= 0 ? 1000 : 600 - index }, [props.labels.selectPoint, markerLabel, point.city_name || point.country_name, point.ip].filter(Boolean).join(' · '))
      .bindTooltip(tooltip(point.city_name || point.country_name || point.ip, point.ip, point.isp || point.asn || ''), ipTooltipOptions)
      .on('click', () => emit('select-compare', point.id))
      .addTo(featureLayer)
  })

  fitVisibleBounds(bounds)
}

function renderRankingFeatures() {
  const source = props.comparePoints.find(point => point.id === props.rankingSourceId)
  if (!source) {
    fitVisibleBounds([])
    return
  }

  const sourceCoordinates = [Number(source.latitude), Number(source.longitude)]
  const bounds = [sourceCoordinates]
  accessibleMarker(sourceCoordinates, { icon: pointIcon('ranking-source-pin', 'SRC'), zIndexOffset: 1200 }, [props.labels.source, source.city_name || source.country_name, source.ip].filter(Boolean).join(' · '))
    .bindTooltip(tooltip(source.city_name || source.country_name || source.ip, source.ip), ipTooltipOptions)
    .addTo(featureLayer)

  props.rankingPoints.forEach(point => {
    const coordinates = [Number(point.latitude), Number(point.longitude)]
    if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return
    bounds.push(coordinates)
    const isBest = point.rank === 1
    const isSelected = point.id === props.selectedServerId
    const markerClass = isBest ? 'ranking-best-pin' : isSelected ? 'ranking-selected-pin' : 'ranking-pin'
    const color = isBest ? '#f06f98' : isSelected ? '#ffc857' : '#8da4ac'
    L.polyline([sourceCoordinates, coordinates], {
      color,
      weight: isBest ? 3.5 : isSelected ? 2.5 : 1.3,
      opacity: isBest || isSelected ? 0.9 : 0.42,
      dashArray: isBest ? null : '5 8'
    }).addTo(featureLayer)
    accessibleMarker(coordinates, { icon: pointIcon(markerClass, point.rank ? String(point.rank) : '·'), zIndexOffset: isBest ? 1000 : 700 - (point.rank || 100) }, [props.labels.selectServer, point.rank ? `#${point.rank}` : '', point.city_name || point.country_name, point.ip].filter(Boolean).join(' · '))
      .bindTooltip(tooltip(`${point.rank ? `#${point.rank}` : '—'} ${point.city_name || point.country_name || point.ip}`, point.ip, `${Math.round(point.distance).toLocaleString()} km · ${point.eligible ? Math.round(point.score) + '/100' : '—'}`), ipTooltipOptions)
      .on('click', () => emit('select-server', point.id))
      .addTo(featureLayer)
  })

  fitVisibleBounds(bounds)
}

onMounted(() => {
  map = L.map(mapElement.value, { zoomControl:false, minZoom:1, maxZoom:18, zoomSnap:0.25, zoomDelta:0.25, worldCopyJump:true })
  map.createPane('graticulePane').style.zIndex = '260'
  map.on('moveend zoomend resize', renderMetricGrid)
  resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan:false }))
  resizeObserver.observe(mapElement.value)
  setTiles()
  scaleControl = L.control({ position:'bottomright' })
  scaleControl.onAdd = () => {
    const container = L.DomUtil.create('div', 'metric-grid-scale')
    container.innerHTML = '<span class="metric-grid-scale-value"></span><span class="metric-grid-scale-bracket" aria-hidden="true"></span>'
    return container
  }
  scaleControl.addTo(map)
  renderFeatures()
  renderMetricGrid()
})

watch(() => props.theme, () => { setTiles(); renderMetricGrid() })
watch(() => props.labels.mapScale, updateScaleControlLabel)
watch(() => [props.client, props.endpoints, props.mode, props.comparePoints, props.selectedCompareIds, props.rankingPoints, props.rankingSourceId, props.selectedServerId], renderFeatures, { deep: true })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  map?.remove()
})
</script>

<style>
.map-shell,.map{position:absolute;inset:0}.map-shell{background:#f2e2e9}.map{z-index:0}
.dark-map{background:#10090d}.dark-map .leaflet-tile-pane{filter:brightness(.62) invert(1) contrast(1.24) hue-rotate(180deg) saturate(.42)}
.map-toolbar{position:absolute;z-index:650;top:14px;right:14px;display:flex;align-items:center;gap:4px;padding:5px;border:1px solid var(--border);border-radius:13px;background:color-mix(in srgb,var(--surface) 94%,transparent);box-shadow:var(--shadow-sm);backdrop-filter:blur(14px)}
.map-toolbar button{min-width:44px;height:44px;padding:0;border:0;border-radius:9px;background:transparent;color:var(--muted);display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:background-color .16s ease,color .16s ease,transform .16s ease}
.map-toolbar button:hover{background:color-mix(in srgb,var(--accent) 11%,var(--surface));color:var(--accent-strong)}.map-toolbar button:active{transform:scale(.94)}.map-toolbar button:focus-visible{outline:2px solid var(--accent-strong);outline-offset:2px}
.map-toolbar svg{width:22px;height:22px;flex:0 0 22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.map-toolbar .map-fit-button{color:var(--text)}
.map-toolbar-divider{width:1px;height:28px;margin:0 2px;background:var(--border)}
.metric-grid-scale{--grid-scale-width:120px;margin-right:10px!important;margin-bottom:27px!important;padding:7px 9px 6px;border:1px solid var(--border);border-radius:11px;background:color-mix(in srgb,var(--surface) 88%,transparent);box-shadow:var(--shadow-sm);backdrop-filter:blur(12px);pointer-events:none;color:var(--text);font:700 12px/1.25 Consolas,"Cascadia Mono",monospace;text-align:center;font-variant-numeric:tabular-nums}.metric-grid-scale-value{display:block;width:var(--grid-scale-width);padding-bottom:7px;white-space:nowrap}.metric-grid-scale-bracket{position:relative;display:block;width:var(--grid-scale-width);height:7px;border:2px solid var(--accent-strong);border-top:0;border-radius:0 0 3px 3px}.metric-grid-scale-bracket:after{content:"";position:absolute;left:50%;bottom:0;width:2px;height:5px;transform:translateX(-50%);background:var(--accent-strong)}
.map-legend{position:absolute;z-index:500;left:18px;bottom:18px;display:flex;gap:12px;flex-wrap:wrap;padding:10px 13px;border:1px solid var(--border);border-radius:12px;background:color-mix(in srgb,var(--surface) 91%,transparent);box-shadow:var(--shadow-sm);backdrop-filter:blur(14px);font-size:14px;color:var(--muted)}
.map-legend span{display:flex;align-items:center;gap:6px;line-height:1.55;padding-bottom:.12em}.legend-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.legend-dot.client{background:#16ae8b}.legend-dot.recommended,.legend-dot.point-a{background:#f06f98}.legend-dot.fallback,.legend-dot.point-b{background:#ffc857}.legend-dot.other{background:#8da4ac}
.map-pin{width:34px;height:34px;border-radius:50% 50% 50% 10%;transform:rotate(-45deg);display:grid;place-items:center;border:3px solid rgba(255,255,255,.96);box-shadow:0 8px 18px rgba(68,18,38,.25);background:#82969d;color:#fff}.map-pin b{font:700 13px/1 "Niramit",sans-serif;transform:rotate(45deg)}.map-pin b.map-pin-label-wide{font-size:10px}.client-pin,.ranking-source-pin{background:#16ae8b}.recommended-pin,.compare-a-pin,.ranking-best-pin{background:#f06f98}.fallback-pin,.compare-b-pin,.ranking-selected-pin{background:#d89c20}.compare-pin,.ranking-pin{background:#6e7f87}.offline-pin{background:#db4b55}.leaflet-tooltip{font-family:"Niramit",sans-serif!important;border:0!important;border-radius:9px!important;box-shadow:0 8px 22px rgba(0,0,0,.18)!important;padding:8px 10px!important;background:var(--surface)!important;color:var(--text)!important}.leaflet-tooltip:before{display:none}
@media(max-width:900px){.map-toolbar{top:12px;right:12px}}
@media(max-width:780px){.map-toolbar{top:10px;right:10px}.map-toolbar button{min-width:42px;height:42px}.map-legend{left:10px;right:10px;bottom:10px;gap:8px;padding:8px 10px;font-size:12px}.metric-grid-scale{margin-bottom:72px!important}}
@media(prefers-reduced-motion:reduce){.map-toolbar button{transition:none}}
</style>
