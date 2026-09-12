import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import * as Vue from 'vue'
import {renderToString} from 'vue/server-renderer'
import {parse,compileScript} from '@vue/compiler-sfc'

function component(path) {
  const {descriptor} = parse(readFileSync(path,'utf8'))
  const compiled = compileScript(descriptor,{id:path,inlineTemplate:true,genDefaultAs:'component'}).content
  const code = compiled.replace(/import\s*\{([^}]+)\}\s*from\s*['"]vue['"];?/g,(_,imports) => `const {${imports.replace(/\s+as\s+/g,':')}} = Vue;`)
  return new Function('Vue',`${code}\nreturn component`)(Vue)
}

test('address CSS removes ellipsis and enables wrapping across visible surfaces', () => {
  const css = readFileSync('src/readability.css','utf8')
  const rule = css.match(/\.app-shell \.ip-text\s*\{([^}]+)\}/)?.[1]
  assert.ok(rule)
  for (const declaration of ['white-space: normal','overflow: visible','overflow-wrap: anywhere','max-height: none','hyphens: none']) assert.ok(rule.includes(declaration))
  assert.ok(css.includes('.leaflet-tooltip.ip-map-tooltip'))
  const app = readFileSync('src/App.vue','utf8')
  assert.ok(!app.includes('<select v-model="rankingSourceId"'))
  assert.equal((app.match(/<WrappingInput/g) || []).length,2)
  assert.ok(app.includes('<code class="ip-text">{{ compareA.ip }}</code>'))
  assert.ok(app.includes('<code class="ip-text">{{ compareB.ip }}</code>'))
  assert.ok(app.includes('<dd class="ip-text">{{ selectedServer.ip }}</dd>'))
})

test('source picker and wrapping field markup retain every IPv4/IPv6 character', async () => {
  const picker = component('src/components/IpSourcePicker.vue')
  const input = component('src/components/WrappingInput.vue')
  for (const ip of ['255.255.255.255','2606:4700:4700::1111','2606:4700:4700:1234:5678:9abc:def0:1111']) {
    const selected = await renderToString(Vue.createSSRApp(picker,{points:[{id:'a',ip,city_name:'Example',country_code:'TH'}],modelValue:'a',label:'Reference IP'}))
    assert.ok(selected.includes(`<span class="ip-text">${ip}</span>`))
    assert.ok(!selected.includes('…'))
    const field = await renderToString(Vue.createSSRApp(input,{modelValue:ip,'aria-label':'IP address'}))
    assert.ok(field.includes('wrap="soft"'))
    assert.ok(field.includes(ip))
  }
})

test('growing address field preserves values and Enter submits without affecting IME', () => {
  const source = readFileSync('src/components/WrappingInput.vue','utf8')
  const handlers = source.slice(source.indexOf('function resize()'),source.indexOf('watch(() =>'))
  const events = []
  const field = {value:{style:{},clientWidth:100,scrollHeight:120,offsetHeight:50,clientHeight:48}}
  const state = {field,props:{modelModifiers:{}},emit:(...args) => events.push(args)}
  vm.createContext(state)
  vm.runInContext(handlers,state)
  const ip = '2606:4700:4700:1234:5678:9abc:def0:1111'
  state.input({target:{value:ip}})
  assert.deepEqual(events[0],['update:modelValue',ip])
  assert.equal(field.value.style.height,'122px')
  let prevented = false
  state.keydown({key:'Enter',isComposing:false,preventDefault:() => {prevented = true}})
  assert.ok(prevented)
  assert.deepEqual(events[1],['submit'])
  state.keydown({key:'Enter',isComposing:true,preventDefault:() => assert.fail('IME input must not submit')})
  assert.equal(events.length,2)
})
