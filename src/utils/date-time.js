const LOCALES = {
  en: 'en-US-u-ca-gregory-nu-latn',
  th: 'th-TH-u-ca-buddhist-nu-latn'
}

function resolveTimeZone(value) {
  const raw = String(value || '').trim()
  const offset = raw.match(/^([+-])(\d{2}):?(\d{2})$/)
  if (offset) {
    const hours = Number(offset[2])
    const minutes = Number(offset[3])
    if (hours <= 14 && minutes < 60) {
      const sign = offset[1] === '-' ? -1 : 1
      const label = `GMT${offset[1]}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
      return { timeZone:'UTC', offsetMs:sign * (hours * 60 + minutes) * 60_000, label }
    }
  }
  if (raw) {
    try {
      new Intl.DateTimeFormat('en', { timeZone:raw }).format(0)
      return { timeZone:raw, offsetMs:0, label:'' }
    } catch {}
  }
  return { timeZone:undefined, offsetMs:0, label:'' }
}

export function getCurrentDateTimeParts(value, language = 'en', referenceTimeZone = '') {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return { date:'—', year:'', era:'', time:'', dayPeriod:'', timeZone:'' }

  const isThai = language === 'th'
  const locale = LOCALES[language] || LOCALES.en
  const zone = resolveTimeZone(referenceTimeZone)
  const zonedDate = zone.offsetMs ? new Date(date.getTime() + zone.offsetMs) : date
  const dateParts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    era: 'short',
    month: '2-digit',
    day: '2-digit',
    ...(zone.timeZone ? { timeZone:zone.timeZone } : {})
  }).formatToParts(zonedDate)
  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: isThai ? 'h23' : 'h12',
    timeZoneName: 'short',
    ...(zone.timeZone ? { timeZone:zone.timeZone } : {})
  }).formatToParts(zonedDate)
  const part = (parts, type) => parts.find(item => item.type === type)?.value || ''

  const year = part(dateParts, 'year')
  const era = part(dateParts, 'era')
  const month = part(dateParts, 'month')
  const day = part(dateParts, 'day')
  const hour = part(timeParts, 'hour').padStart(2, '0')
  const minute = part(timeParts, 'minute').padStart(2, '0')
  const second = part(timeParts, 'second').padStart(2, '0')
  const dayPeriod = part(timeParts, 'dayPeriod')
  const timeZone = part(timeParts, 'timeZoneName')

  return {
    date: `${day}/${month}`,
    year,
    era,
    time: `${hour}:${minute}:${second}`,
    dayPeriod,
    timeZone: zone.label || timeZone
  }
}

export function formatCurrentDateTime(value, language = 'en', referenceTimeZone = '') {
  const parts = getCurrentDateTimeParts(value, language, referenceTimeZone)
  if (parts.date === '—') return '—'
  const timeSuffix = [parts.dayPeriod, parts.timeZone].filter(Boolean).join(' ')
  const dateText = language === 'th' ? `${parts.date} ${parts.era} ${parts.year}` : `${parts.date}/${parts.year} ${parts.era}`
  return `${dateText}, ${parts.time}${timeSuffix ? ` ${timeSuffix}` : ''}`
}
