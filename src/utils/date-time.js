const LOCALES = {
  en: 'en-US-u-ca-gregory-nu-latn',
  th: 'th-TH-u-ca-buddhist-nu-latn'
}

export function formatCurrentDateTime(value, language = 'en') {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const isThai = language === 'th'
  const locale = LOCALES[language] || LOCALES.en
  const dateParts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    era: 'short',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: isThai ? 'h23' : 'h12',
    timeZoneName: 'short'
  }).formatToParts(date)
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

  const dateText = isThai ? `${day}/${month}/${era} ${year}` : `${month}/${day}/${year} ${era}`
  const timeSuffix = [dayPeriod, timeZone].filter(Boolean).join(' ')
  return `${dateText}, ${hour}:${minute}:${second}${timeSuffix ? ` ${timeSuffix}` : ''}`
}
