const SECRET_QUERY = /([?&](?:api_?key|key|token|access_?token|authorization)=)[^&\s]+/gi
const AUTH_VALUE = /\b(?:bearer\s+|sk-)[a-z0-9._-]{12,}/gi
const LONG_HEX_SECRET = /\b[a-f0-9]{32,}\b/gi

export function safeLogDetail(value, maximumLength = 180) {
  const cleaned = String(value ?? '')
    .replace(SECRET_QUERY, '$1[redacted]')
    .replace(AUTH_VALUE, '[redacted]')
    .replace(LONG_HEX_SECRET, '[redacted]')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= maximumLength) return cleaned
  return `${cleaned.slice(0, Math.max(1, maximumLength - 1))}…`
}

export function formatLogTime(date = new Date(), language = 'en') {
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(date)
}
