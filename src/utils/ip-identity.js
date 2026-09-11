// Browser-safe address identity. Do not treat a hostname as an IP address.
export function canonicalIp(value) {
  const raw = String(value || '').trim().replace(/^\[|\]$/g, '').toLowerCase()
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(raw)) {
    const bytes = raw.split('.').map(Number)
    return bytes.every(byte => byte <= 255) ? bytes.join('.') : ''
  }
  if (!raw.includes(':') || !/^[\da-f:.]+$/.test(raw)) return ''
  try { return new URL(`https://[${raw}]/`).hostname.slice(1, -1) }
  catch { return '' }
}

export function sameIp(first, second) {
  const key = canonicalIp(first)
  return Boolean(key) && key === canonicalIp(second)
}
