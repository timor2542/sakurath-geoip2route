import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiProgress, progressBar } from '../server/api-progress.mjs'
import { createLocalGeoHandler } from '../server/local-geo-api.mjs'
import { getCurrentLocation } from '../src/services/api.js'
import { mergeCurrentIp } from '../src/utils/current-ip.js'
import { handler as currentFunction } from '../netlify/functions/ip.mjs'

const location = {ip:'8.8.8.8',latitude:37.4,longitude:-122.1,source:'ip2location'}
function capturedProgress(isTTY = false) {
  let text = ''
  const progress = createApiProgress({output:{isTTY,write:value => {text += value}},clock:() => 1000})
  return {progress,text:() => text}
}
async function invoke(handler, {path='ip',peer='127.0.0.1',headers={},method='GET'} = {}) {
  const response = {headers:{},setHeader(name,value) {this.headers[name] = value},end(body) {this.body = JSON.parse(body)}}
  await handler({url:`/.netlify/functions/${path}`,method,headers,socket:{remoteAddress:peer}},response,() => {response.next = true})
  return response
}

test('terminal progress advances on real stages and never completes failed requests', () => {
  const capture = capturedProgress()
  const success = capture.progress.begin('current')
  success.resolved(); success.fetched(); success.end(); success.end()
  const failure = capture.progress.begin()
  failure.resolved(); failure.end(false)
  const text = capture.text()
  for (const stage of ['0/3','1/3','2/3','3/3']) assert.ok(text.includes(stage))
  assert.equal((text.match(/OK /g) || []).length, 1)
  assert.match(text, /ERROR \[######------------\] 1\/3/)
  assert.equal(progressBar(3), '[##################] 3/3')
  assert.doesNotMatch(text, /8\.8\.8\.8|test-key|https:\/\//)
  capture.progress.close()
})

test('TTY progress supports concurrent requests and safe repeated cleanup', () => {
  const capture = capturedProgress(true)
  const first = capture.progress.begin()
  const second = capture.progress.begin('current')
  first.resolved(); second.resolved(); second.end(false); first.fetched(); first.end()
  assert.match(capture.text(), /2 active/)
  assert.match(capture.text(), /API #2.*ERROR/)
  assert.match(capture.text(), /\u001b\[2K/)
  capture.progress.close(); capture.progress.close()
})

test('localhost current IP uses fixed discovery endpoint, then live lookup', async () => {
  const capture = capturedProgress()
  const calls = []
  const handler = createLocalGeoHandler({key:'test-key',progress:capture.progress,
    fetcher:async (url,options) => {calls.push(url); assert.ok(options.signal); return {ok:true,text:async () => '8.8.8.8\n'}},
    locate:async (ip,key) => {calls.push(ip); assert.equal(key,'test-key'); return location}
  })
  const result = await invoke(handler,{peer:'::1',headers:{'x-forwarded-for':'1.1.1.1'}})
  assert.equal(result.statusCode,200)
  assert.equal(result.body.detection_source,'development_host')
  assert.deepEqual(calls,['https://ip.ip2location.io/','8.8.8.8'])
  assert.match(capture.text(),/3\/3 Response ready/)
  assert.equal(result.headers['cache-control'],'no-store')
})

test('public connection IP wins over spoofed forwarded headers', async () => {
  const handler = createLocalGeoHandler({key:'test-key',progress:capturedProgress().progress,
    fetcher:async () => assert.fail('must not discover host egress'),
    locate:async ip => {assert.equal(ip,'8.8.8.8'); return location}
  })
  const result = await invoke(handler,{peer:'::ffff:8.8.8.8',headers:{'x-forwarded-for':'1.1.1.1'}})
  assert.equal(result.statusCode,200)
  assert.equal(result.body.detection_source,'direct_connection')
})

test('private remote clients and missing keys fail before external requests', async () => {
  for (const args of [{key:'test-key',peer:'192.168.1.12'},{key:'',peer:'127.0.0.1'}]) {
    const capture = capturedProgress()
    const handler = createLocalGeoHandler({key:args.key,progress:capture.progress,
      fetcher:async () => assert.fail('must not send discovery request'),locate:async () => assert.fail('must not spend API quota')})
    const result = await invoke(handler,{peer:args.peer})
    assert.equal(result.statusCode,502)
    assert.match(result.body.error,args.key ? /LAN\/private proxy/ : /API_KEY is missing/)
    assert.doesNotMatch(capture.text(),/3\/3/)
  }
})

test('failed IP discovery and lookup show failed progress, not fake success', async () => {
  for (const discoveryFails of [true,false]) {
    const capture = capturedProgress()
    const handler = createLocalGeoHandler({key:'test-key',progress:capture.progress,
      fetcher:async () => ({ok:!discoveryFails,text:async () => discoveryFails ? 'not-an-ip' : '8.8.8.8'}),
      locate:async () => {throw new Error('Quota exhausted')}
    })
    const result = await invoke(handler)
    assert.equal(result.statusCode,502)
    assert.match(result.body.error,discoveryFails ? /Could not detect/ : /Quota exhausted/)
    assert.match(capture.text(),/ERROR/)
    assert.doesNotMatch(capture.text(),/3\/3/)
  }
})

test('hostname lookups share progress and preserve the resolved target', async () => {
  const capture = capturedProgress()
  const handler = createLocalGeoHandler({key:'test-key',progress:capture.progress,
    resolve:async host => {assert.equal(host,'dns.google'); return {address:'8.8.8.8'}},locate:async () => location})
  const result = await invoke(handler,{path:'lookup?target=dns.google'})
  assert.equal(result.statusCode,200)
  assert.equal(result.body.host,'dns.google')
  assert.equal(result.body.resolved_ip,'8.8.8.8')
  assert.match(capture.text(),/3\/3 Response ready/)
  assert.equal((await invoke(handler,{method:'POST'})).statusCode,405)
  assert.equal((await invoke(handler,{path:'other'})).next,true)
})

test('current IP service returns validated live data', async t => {
  t.mock.method(globalThis,'fetch',async (url,options) => {
    assert.equal(url,'/.netlify/functions/ip'); assert.ok(options.signal)
    return {ok:true,json:async () => location}
  })
  assert.deepEqual(await getCurrentLocation(),location)
})

test('current IP service rejects API errors, invalid coordinates and aborts without demo fallback', async t => {
  const mock = t.mock.method(globalThis,'fetch',async () => ({ok:false,json:async () => ({error:'API key missing'})}))
  await assert.rejects(getCurrentLocation(),/API key missing/)
  mock.mock.mockImplementation(async () => ({ok:true,json:async () => ({...location,latitude:null})}))
  await assert.rejects(getCurrentLocation(),/no usable coordinates/)
  mock.mock.mockImplementation(async () => {throw new DOMException('Aborted','AbortError')})
  await assert.rejects(getCurrentLocation(),/timed out/)
})

test('adding a new current IP preserves other points and clears old current flag', () => {
  const points = [{id:'old',ip:'1.1.1.1',isCurrentIp:true}]
  const result = mergeCurrentIp(points,location,'new')
  assert.equal(result.existed,false)
  assert.equal(result.id,'new')
  assert.equal(result.points.length,2)
  assert.equal(result.points[0].isCurrentIp,false)
  assert.equal(result.points[1].isCurrentIp,true)
  assert.equal(points[0].isCurrentIp,true)
  assert.throws(() => mergeCurrentIp(points,{...location,source:'demo'},'invalid'),/live IP2Location/)
})

test('duplicate current IP updates location without losing endpoint settings', () => {
  const measurement = {kind:'browser',latency:25}
  const points = [{id:'existing',ip:'8.8.8.8',target:'dns.google',probeUrl:'https://dns.google/',measurement,latitude:0}]
  const result = mergeCurrentIp(points,location,'unused')
  assert.equal(result.existed,true)
  assert.equal(result.id,'existing')
  assert.equal(result.points.length,1)
  assert.equal(result.points[0].target,'dns.google')
  assert.equal(result.points[0].probeUrl,'https://dns.google/')
  assert.equal(result.points[0].measurement,measurement)
  assert.equal(result.points[0].latitude,37.4)
  assert.equal(points[0].latitude,0)
})

test('hosted current IP rejects spoofed forwarding headers without lookup', async t => {
  t.mock.method(globalThis,'fetch',async () => assert.fail('no trusted connection IP'))
  const result = await currentFunction({httpMethod:'GET',headers:{'x-forwarded-for':'8.8.8.8','client-ip':'8.8.8.8'}})
  assert.equal(result.statusCode,400)
  assert.match(JSON.parse(result.body).error,/connection IP was not available/)
  assert.equal((await currentFunction({httpMethod:'OPTIONS'})).statusCode,204)
  assert.equal((await currentFunction({httpMethod:'POST'})).statusCode,405)
})
