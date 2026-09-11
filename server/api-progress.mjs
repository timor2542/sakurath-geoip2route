// Request-stage progress, not downloaded bytes or a prediction of remaining time.
export function progressBar(completed, total = 3, width = 18) {
  const filled = Math.round(Math.max(0, Math.min(total, completed)) / total * width)
  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}] ${completed}/${total}`
}

export function createApiProgress({ output = process.stdout, clock = Date.now, intervalMs = 120 } = {}) {
  const active = new Map()
  let sequence = 0
  let frame = 0
  let timer
  const frames = ['|', '/', '-', '\\']
  function line(job, state) {
    const elapsed = ((clock() - job.started) / 1000).toFixed(1)
    return `[GeoIP2Route API #${job.id}] ${state} ${progressBar(job.stage)} ${job.label} (${elapsed}s)`
  }
  function render() {
    const job = active.values().next().value
    if (job && output.isTTY) output.write(`\r\x1b[2K${line(job, frames[frame++ % frames.length])} | ${active.size} active`)
  }
  function changed(job) {
    if (output.isTTY) render()
    else output.write(`${line(job, 'WAIT')}\n`)
  }
  return {
    begin(kind = 'lookup') {
      const job = { id:++sequence, stage:0, started:clock(), label:kind === 'current' ? 'Detecting current public IP' : 'Resolving target' }
      let ended = false
      active.set(job.id, job)
      changed(job)
      if (output.isTTY && !timer) { timer = setInterval(render, intervalMs); timer.unref?.() }
      return {
        resolved() { if (!ended) { job.stage = 1; job.label = 'Fetching IP2Location'; changed(job) } },
        fetched() { if (!ended) { job.stage = 2; job.label = 'Preparing response'; changed(job) } },
        end(success = true) {
          if (ended) return
          ended = true
          if (success) job.stage = 3
          job.label = success ? 'Response ready' : 'Request failed; see the app error'
          active.delete(job.id)
          if (output.isTTY) output.write('\r\x1b[2K')
          output.write(`${line(job, success ? 'OK' : 'ERROR')}\n`)
          if (!active.size) { clearInterval(timer); timer = undefined }
          else render()
        }
      }
    },
    close() { clearInterval(timer); timer = undefined; active.clear(); if (output.isTTY) output.write('\r\x1b[2K') }
  }
}
