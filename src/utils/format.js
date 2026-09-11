// Display the full kilometre value: "1.4k km" is easy to misread as "14k km".
export function formatDistance(km, language = 'en') {
  if (typeof km !== 'number' || !Number.isFinite(km) || km < 0) return '—'
  const unit = language === 'th' ? 'กม.' : 'km'
  if (km > 0 && km < 1) return `< 1 ${unit}`
  const number = new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
    maximumFractionDigits: 0, useGrouping: true
  }).format(km)
  return `${number} ${unit}`
}
