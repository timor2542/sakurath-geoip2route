<template>
  <section :class="['activity-console', { collapsed: !open }]" aria-labelledby="activity-console-title">
    <header class="activity-console-head">
      <div class="activity-console-title">
        <span class="activity-console-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m5 7 4 4-4 4m6 1h8"/></svg>
        </span>
        <span>
          <strong id="activity-console-title">{{ labels.title }}</strong>
          <small>{{ labels.note }}</small>
        </span>
      </div>
      <div class="activity-console-actions">
        <span class="activity-console-count" :aria-label="`${labels.entries}: ${logs.length}`">{{ logs.length }}</span>
        <button class="console-clear-button" type="button" @click="$emit('clear')" :disabled="!logs.length" :aria-label="labels.clear" :title="labels.clear">
          <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg>
          <span>{{ labels.clear }}</span>
        </button>
        <button class="icon-only-button console-toggle-button" type="button" @click="$emit('toggle')" :aria-expanded="open" :aria-label="open ? labels.collapse : labels.expand" :title="open ? labels.collapse : labels.expand">
          <svg class="button-icon" :class="{ expanded: open }" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
        </button>
      </div>
    </header>

    <template v-if="open">
      <ol ref="output" class="activity-console-output" role="log" aria-live="off">
        <li v-for="entry in logs" :key="entry.id" :class="['activity-console-line', `level-${entry.level.toLowerCase()}`]">
          <time>{{ entry.time }}</time>
          <strong>[{{ entry.level }}]</strong>
          <span>{{ entry.message }}</span>
        </li>
      </ol>
      <p class="activity-console-foot">{{ labels.serverNote }}</p>
    </template>
  </section>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  logs: { type:Array, required:true },
  open: { type:Boolean, required:true },
  labels: { type:Object, required:true }
})
defineEmits(['clear', 'toggle'])

const output = ref(null)
watch(() => props.logs.length, async () => {
  await nextTick()
  if (output.value) output.value.scrollTop = output.value.scrollHeight
})
</script>
