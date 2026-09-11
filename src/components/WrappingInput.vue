<template>
  <textarea ref="field" class="wrapping-input" :value="modelValue" rows="1" wrap="soft" spellcheck="false" autocapitalize="none" autocomplete="off" @input="input" @keydown="keydown"></textarea>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({modelValue:{type:String,default:''},modelModifiers:{type:Object,default:() => ({})}})
const emit = defineEmits(['update:modelValue','submit'])
const field = ref(null)
let observer
let previousWidth = -1

function resize() {
  const element = field.value
  if (!element || !element.clientWidth) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`
}
function input(event) {
  const value = event.target.value
  emit('update:modelValue', props.modelModifiers.trim ? value.trim() : value)
  resize()
}
function keydown(event) {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault()
    emit('submit')
  }
}
watch(() => props.modelValue, () => nextTick(resize))
onMounted(() => {
  resize()
  document.fonts?.ready.then(resize)
  document.fonts?.addEventListener('loadingdone',resize)
  observer = new ResizeObserver(entries => {
    const width = entries[0]?.contentRect.width
    if (width !== previousWidth) { previousWidth = width; resize() }
  })
  observer.observe(field.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.fonts?.removeEventListener('loadingdone',resize)
})
</script>
