import test from 'node:test'
import assert from 'node:assert/strict'
import { clearGeolocationCache, geolocate } from '../netlify/functions/_shared.mjs'
import { config as lookupConfig } from '../netlify/functions/lookup.mjs'
import { config as currentIpConfig } from '../netlify/functions/ip.mjs'
import { lookupTarget } from '../src/services/api.js'

test('hosted GeoIP functions declare per-IP Netlify rate limits', () => {
  assert.deepEqual(lookupConfig, {
    path:'/.netlify/functions/lookup',
    rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}
  })
  assert.deepEqual(currentIpConfig, {
    path:'/.netlify/functions/ip',
    rateLimit:{windowLimit:20,windowSize:60,aggregateBy:['ip','domain']}
  })
})

test('repeated live geolocation reuses the short server cache', async () => {
  clearGeolocationCache()
  let requests = 0
  const fetcher = async () => {
    requests += 1
    return {ok:true,json:async () => ({
      ip:'8.8.8.8',country_code:'US',latitude:37.4,longitude:-122.1
    })}
  }
  const first = await geolocate('8.8.8.8','test-key',{fetcher,now:1000})
  first.city_name = 'changed-by-caller'
  const second = await geolocate('8.8.8.8','test-key',{fetcher,now:2000})
  assert.equal(requests,1)
  assert.equal(second.city_name,'')
  assert.equal(second.source,'ip2location')
})

test('frontend explains a platform 429 even when its body is not JSON', async t => {
  t.mock.method(globalThis,'fetch',async () => ({status:429,ok:false,json:async () => {throw new Error('plain response')}}))
  await assert.rejects(lookupTarget('8.8.8.8'),/Too many GeoIP requests/)
})
