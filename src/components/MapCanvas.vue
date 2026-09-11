<template>
  <div class="map-shell" :class="{ 'dark-map': theme === 'dark' }">
    <div ref="mapElement" class="map" role="region" :aria-label="labels.map"></div>
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
let boundsSignature = ''

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
  const signature = JSON.stringify([props.mode, props.rankingSourceId, bounds])
  if (signature === boundsSignature) return
  boundsSignature = signature
  const width = map.getSize().x
  const left = width > 1180 ? 420 : width > 900 ? 368 : 40
  const right = width > 1180 ? 460 : width > 900 ? 402 : 40
  if (bounds.length > 1) map.fitBounds(bounds, { paddingTopLeft:[left,45], paddingBottomRight:[right,65], maxZoom:5 })
  else if (bounds.length) map.setView(bounds[0], 7)
  else map.setView([18,20], 2)
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

  if (points.length > 1) map.fitBounds(points, { padding: [58, 58], maxZoom: 6 })
  else map.setView(clientPoint, 7)
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
    map.setView([18, 20], 2)
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
  map = L.map(mapElement.value, { zoomControl: false, minZoom: 2, worldCopyJump: true })
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  setTiles()
  renderFeatures()
})

watch(() => props.theme, setTiles)
watch(() => [props.client, props.endpoints, props.mode, props.comparePoints, props.selectedCompareIds, props.rankingPoints, props.rankingSourceId, props.selectedServerId], renderFeatures, { deep: true })

onBeforeUnmount(() => map?.remove())
</script>

<style>
.map-shell,.map{position:absolute;inset:0}.map-shell{background:#f2e2e9}.map{z-index:0}
.dark-map{background:#10090d}.dark-map .leaflet-tile-pane{filter:brightness(.62) invert(1) contrast(1.24) hue-rotate(180deg) saturate(.42)}
.map-legend{position:absolute;z-index:500;left:18px;bottom:18px;display:flex;gap:12px;flex-wrap:wrap;padding:10px 13px;border:1px solid var(--border);border-radius:12px;background:color-mix(in srgb,var(--surface) 91%,transparent);box-shadow:var(--shadow-sm);backdrop-filter:blur(14px);font-size:14px;color:var(--muted)}
.map-legend span{display:flex;align-items:center;gap:6px;line-height:1.55;padding-bottom:.12em}.legend-dot{width:8px;height:8px;border-radius:50%;display:inline-block}.legend-dot.client{background:#16ae8b}.legend-dot.recommended,.legend-dot.point-a{background:#f06f98}.legend-dot.fallback,.legend-dot.point-b{background:#ffc857}.legend-dot.other{background:#8da4ac}
.map-pin{width:34px;height:34px;border-radius:50% 50% 50% 10%;transform:rotate(-45deg);display:grid;place-items:center;border:3px solid rgba(255,255,255,.96);box-shadow:0 8px 18px rgba(68,18,38,.25);background:#82969d;color:#fff}.map-pin b{font:700 13px/1 "Niramit",sans-serif;transform:rotate(45deg)}.map-pin b.map-pin-label-wide{font-size:10px}.client-pin,.ranking-source-pin{background:#16ae8b}.recommended-pin,.compare-a-pin,.ranking-best-pin{background:#f06f98}.fallback-pin,.compare-b-pin,.ranking-selected-pin{background:#d89c20}.compare-pin,.ranking-pin{background:#6e7f87}.offline-pin{background:#db4b55}.leaflet-tooltip{font-family:"Niramit",sans-serif!important;border:0!important;border-radius:9px!important;box-shadow:0 8px 22px rgba(0,0,0,.18)!important;padding:8px 10px!important;background:var(--surface)!important;color:var(--text)!important}.leaflet-tooltip:before{display:none}.leaflet-control-zoom a{background:var(--surface)!important;color:var(--text)!important;border-color:var(--border)!important}
@media(max-width:780px){.map-legend{left:10px;right:10px;bottom:10px;gap:8px;padding:8px 10px;font-size:12px}}
</style>
