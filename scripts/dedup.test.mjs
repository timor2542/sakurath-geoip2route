import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { canonicalIp, sameIp } from '../src/utils/ip-identity.js'
import { deduplicatePoints, remapPointSelection } from '../src/utils/point-list.js'
import { mergeCurrentIp } from '../src/utils/current-ip.js'
import { normalizeTarget, parseTargetRecords } from '../src/utils/import.js'
import { getCurrentLocation, lookupTarget } from '../src/services/api.js'
import { probeMatchesPoint } from '../src/services/probe.js'

const compressed = '2606:4700:4700::1111'
const expanded = '2606:4700:4700:0:0:0:0:1111'
const live = ip => ({ip,latitude:13.75,longitude:100.5,source:'ip2location'})

// Exercise the actual page actions with mocked network calls, without a browser.
const source = readFileSync('src/App.vue','utf8')
function functionSource(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`,'m'))
  assert.ok(start >= 0, `Missing page action: ${name}`)
  const rest = source.slice(start)
  const next = rest.slice(1).search(/\n(?:async function |function |watch\()/)
  assert.ok(next >= 0)
  return rest.slice(0,next + 1)
}
function page(points, lookup = async target => live(target)) {
  const notices = []
  const state = {canonicalIp,sameIp,deduplicatePoints,remapPointSelection,mergeCurrentIp,normalizeTarget,parseTargetRecords,
    lookupTarget:lookup,getCurrentLocation:async () => live(expanded),showToast:message => notices.push(message),writeActivity:() => {},t:key => key,notices}
  const values = {comparePoints:points,compareTarget:'',addingComparePoint:false,addingCurrentIp:false,appMode:'compare',rankingBasis:'geo',rankingSourceId:points[0]?.id || '',selectedServerId:points[1]?.id || '',selectedCompareIds:points.slice(0,2).map(point => point.id),bulkInput:'',bulkMode:'append',bulkSourceName:'',bulkLoading:false,bulkProgress:0,bulkTotal:0,showBulk:true,syncingCompare:false,measurementBusy:false,compareRefreshTotal:points.length,compareProgress:0,refreshTotal:0,currentIpError:'',currentIpNotice:'',client:null}
  for (const [key,value] of Object.entries(values)) state[key] = {value}
  vm.createContext(state)
  vm.runInContext(['selectComparePoint','applyPointResult','commitPoints','addComparePoint','addBulkPoints','refreshComparePoints','addCurrentIp'].map(functionSource).join('\n'),state)
  return state
}

test('canonical IPs identify equivalent IPv6 while preserving distinct addresses', () => {
  assert.equal(canonicalIp(expanded),compressed)
  assert.equal(canonicalIp(' [2606:4700:4700:0000:0000:0000:0000:1111] '),compressed)
  assert.equal(canonicalIp('2001:4860:4860:0000:0000:0000:0000:ABCD'),'2001:4860:4860::abcd')
  assert.ok(sameIp(compressed,expanded))
  assert.ok(!sameIp(compressed,'2606:4700:4700::1001'))
  assert.ok(!sameIp('',''))
  for (const value of ['dns.google','8.8.8.999','https://8.8.8.8/','bad:ip','fe80::1%eth0']) assert.equal(canonicalIp(value),'')
  assert.equal(parseTargetRecords(`${compressed}\n${expanded}`).length,1)
  assert.ok(probeMatchesPoint({ip:expanded},`https://[${compressed}]/`))
})

test('merging retains stable IDs, live geography and a whole probe configuration', () => {
  const measurement = {kind:'browser',latency:25}
  const original = [{id:'a',...live(compressed),source:'sample'},
    {id:'b',...live(expanded),target:'dns.example.com',host:'dns.example.com',probeUrl:'https://dns.example.com/health',measurement,isCurrentIp:true}]
  const result = deduplicatePoints(original)
  assert.equal(result.points.length,1)
  assert.equal(result.idMap.get('b'),'a')
  assert.equal(result.points[0].source,'ip2location')
  assert.equal(result.points[0].target,'dns.example.com')
  assert.equal(result.points[0].measurement,measurement)
  assert.equal(result.points[0].isCurrentIp,true)
  assert.equal(original[1].ip,expanded)
  const selection = remapPointSelection(result,{selectedCompareIds:['b','a'],rankingSourceId:'b',selectedServerId:'a'})
  assert.deepEqual(selection,{selectedCompareIds:['a'],rankingSourceId:'a',selectedServerId:''})
  const conflict = deduplicatePoints([{...original[0],target:'first.example.com',probeUrl:'https://first.example.com/health'},original[1]])
  assert.equal(conflict.points[0].probeUrl,'https://first.example.com/health')
  assert.equal(conflict.points[0].target,'first.example.com')
  assert.equal(conflict.points[0].measurement,undefined)
})

test('current IP merges expanded IPv6 and repairs existing duplicate records', () => {
  const result = mergeCurrentIp([{id:'a',...live(compressed)},{id:'b',...live(expanded)}],live(expanded),'unused')
  assert.equal(result.existed,true)
  assert.equal(result.id,'a')
  assert.equal(result.points.length,1)
  assert.equal(result.idMap.get('b'),'a')
  assert.equal(result.points[0].ip,compressed)
  assert.equal(mergeCurrentIp(result.points,live(compressed),'again').points.length,1)
})

test('both API service entrypoints normalize returned IPv6 before list insertion', async t => {
  t.mock.method(globalThis,'fetch',async () => ({ok:true,json:async () => live(expanded)}))
  assert.equal((await getCurrentLocation()).ip,compressed)
  assert.equal((await lookupTarget(compressed)).ip,compressed)
})

test('page manual and CSV addition share IP identity without duplicate markers', async () => {
  const state = page([{id:'v6',...live(expanded),target:'existing.example.com',probeUrl:'https://existing.example.com/health'}],async target => live(target === '8.8.8.8' ? target : compressed))
  for (const target of [compressed,expanded,'alias.example.com']) {
    state.compareTarget.value = target
    await state.addComparePoint()
  }
  assert.equal(state.comparePoints.value.length,1)
  assert.equal(state.comparePoints.value[0].ip,compressed)
  assert.equal(state.comparePoints.value[0].target,'existing.example.com')
  assert.equal(state.selectedCompareIds.value[0],'v6')
  assert.ok(state.notices.includes('duplicateIpUpdated'))
  state.bulkInput.value = `${expanded}\n${compressed}\nalias.example.com\n8.8.8.8\n8.8.8.8`
  await state.addBulkPoints()
  assert.equal(state.comparePoints.value.length,2)
  assert.equal(new Set(state.comparePoints.value.map(point => canonicalIp(point.ip))).size,2)

  state.bulkMode.value = 'replace'
  state.bulkInput.value = '8.8.8.8'
  await state.addBulkPoints()
  assert.equal(state.comparePoints.value.length,1)
  assert.equal(state.comparePoints.value[0].ip,'8.8.8.8')

  const failed = page([{id:'kept',...live('1.1.1.1')}],async () => { throw new Error('Lookup failed') })
  failed.bulkMode.value = 'replace'
  failed.bulkInput.value = '9.9.9.9'
  await failed.addBulkPoints()
  assert.equal(failed.comparePoints.value.length,1)
  assert.equal(failed.comparePoints.value[0].id,'kept')
  assert.equal(failed.showBulk.value,true)
  assert.ok(failed.notices.includes('bulkReplaceAborted'))
})

test('page refresh merges converging DNS results, remaps selection and keeps failed entries', async () => {
  const state = page([{id:'a',target:'a.example.com',...live('8.8.8.8')},
    {id:'b',target:'b.example.com',probeUrl:'https://b.example.com/health',...live('1.1.1.1')},
    {id:'c',target:'offline.example.com',...live('9.9.9.9')}],async target => {
      if (target === 'offline.example.com') throw new Error('Lookup failed')
      return live('8.8.8.8')
    })
  state.rankingSourceId.value = 'b'
  state.selectedServerId.value = 'a'
  await state.refreshComparePoints()
  assert.equal(state.comparePoints.value.length,2)
  assert.equal(state.compareProgress.value,3)
  assert.equal(state.comparePoints.value[1].id,'c')
  assert.equal(state.rankingSourceId.value,'a')
  assert.equal(state.selectedServerId.value,'c')
  assert.equal(state.selectedCompareIds.value.length,1)
  assert.equal(state.comparePoints.value[0].probeUrl,'https://b.example.com/health')
  assert.equal(state.comparePoints.value[0].target,'b.example.com')
  assert.match(state.notices.at(-1),/partialUpdate.*duplicatesMerged: 1/)
})

test('page Add current IP preserves surviving selection across repeated IPv6 lookups', async () => {
  const state = page([{id:'a',...live(compressed)},{id:'b',...live(expanded)},{id:'c',...live('8.8.8.8')}])
  state.selectedCompareIds.value = ['b','c']
  await state.addCurrentIp()
  await state.addCurrentIp()
  assert.equal(state.currentIpError.value,'')
  assert.equal(state.comparePoints.value.length,2)
  assert.equal(state.selectedCompareIds.value.join(','),'a,c')
  assert.equal(state.rankingSourceId.value,'a')
  assert.equal(state.comparePoints.value.filter(point => point.isCurrentIp).length,1)
})
