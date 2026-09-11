<template>
  <div ref="root" class="source-selector ip-source-picker" @keydown.esc.prevent="close(true)">
    <span :id="`${id}-label`">{{ label }}</span>
    <button ref="trigger" class="ip-source-trigger" type="button" :disabled="disabled" :aria-expanded="open" :aria-controls="`${id}-options`" :aria-labelledby="`${id}-label ${id}-selected`" @click="open = !open">
      <span :id="`${id}-selected`">
        <template v-if="selected"><strong>{{ selected.country_code }} · {{ selected.city_name || selected.country_name }}</strong><span class="ip-text">{{ selected.ip }}</span></template>
        <span v-else>{{ emptyLabel }}</span>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true" :class="{ expanded:open }"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div v-if="open" :id="`${id}-options`" class="ip-source-options" role="group" :aria-label="label">
      <button v-for="point in points" :key="point.id" type="button" :aria-pressed="point.id === modelValue" :disabled="disabled" @click="choose(point.id)">
        <strong>{{ point.country_code }} · {{ point.city_name || point.country_name }}</strong>
        <span class="ip-text">{{ point.ip }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
const props = defineProps({modelValue:{type:String,default:''},points:{type:Array,default:() => []},disabled:Boolean,label:String,emptyLabel:String})
const emit = defineEmits(['update:modelValue'])
const id = useId()
const root = ref(null)
const trigger = ref(null)
const open = ref(false)
const selected = computed(() => props.points.find(point => point.id === props.modelValue))
function close(focus = false) { open.value = false; if (focus) trigger.value?.focus() }
function choose(value) { if (!props.disabled) { emit('update:modelValue',value); close(true) } }
function outside(event) { if (!root.value?.contains(event.target)) close() }
watch(() => props.disabled, value => { if (value) close() })
onMounted(() => document.addEventListener('pointerdown',outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown',outside))
</script>
