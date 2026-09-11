import { normalizeProbeUrl, probeMatchesPoint } from '../services/probe.js'

const TARGET_HEADERS = ['target', 'ip', 'ip_address', 'address', 'hostname', 'host']
const PROBE_HEADERS = ['probe_url', 'probe', 'health_url']

const COLUMN_ROLES = {
  target: { aliases: TARGET_HEADERS, role: 'target', labelKey: 'csvRoleTarget', usage: 'required' },
  probe: { aliases: PROBE_HEADERS, role: 'probe', labelKey: 'csvRoleProbe', usage: 'optional' },
  countryName: { aliases: ['country_name', 'country', 'country_full_name'], role: 'countryName', labelKey: 'csvRoleCountryName', usage: 'reference' },
  countryCode: { aliases: ['country_code', 'country_short', 'country_iso', 'iso2'], role: 'countryCode', labelKey: 'csvRoleCountryCode', usage: 'reference' },
  region: { aliases: ['region_name', 'region', 'state', 'state_name'], role: 'region', labelKey: 'csvRoleRegion', usage: 'reference' },
  city: { aliases: ['city_name', 'city'], role: 'city', labelKey: 'csvRoleCity', usage: 'reference' },
  latitude: { aliases: ['latitude', 'lat'], role: 'latitude', labelKey: 'csvRoleLatitude', usage: 'reference' },
  longitude: { aliases: ['longitude', 'lng', 'lon'], role: 'longitude', labelKey: 'csvRoleLongitude', usage: 'reference' },
  isp: { aliases: ['isp', 'isp_name'], role: 'isp', labelKey: 'csvRoleIsp', usage: 'reference' },
  asn: { aliases: ['asn', 'as_number'], role: 'asn', labelKey: 'csvRoleAsn', usage: 'reference' },
  usageType: { aliases: ['usage_type', 'network_type'], role: 'usageType', labelKey: 'csvRoleUsageType', usage: 'reference' },
  timezone: { aliases: ['timezone', 'time_zone'], role: 'timezone', labelKey: 'csvRoleTimezone', usage: 'reference' }
}

function normalizeHeader(value = '') {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function columnRole(header) {
  const normalized = normalizeHeader(header)
  const match = Object.values(COLUMN_ROLES).find(item => item.aliases.includes(normalized))
  return match
    ? { role: match.role, labelKey: match.labelKey, usage: match.usage }
    : { role: 'unknown', labelKey: 'csvRoleUnknown', usage: 'ignored' }
}

export function normalizeTarget(value = '') {
  const raw = String(value).trim()
  if (!raw || raw.startsWith('#')) return ''
  try {
    const isBareIpv6 = raw.includes(':') && !raw.includes('/') && !raw.startsWith('[')
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : isBareIpv6 ? `https://[${raw}]` : `https://${raw}`)
    if (url.username || url.password || url.port) return ''
    const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
    if (host.includes(':')) return host // URL constructor has validated IPv6 syntax.
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ? host : ''
  } catch { return '' }
}

function csvRow(line) {
  const cells = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { cells.push(value.trim()); value = '' }
    else value += char
  }
  if (quoted) throw new Error('Unclosed CSV quote. Use one record per line.')
  cells.push(value.trim())
  return cells
}

/**
 * Inspect a pasted/imported CSV without sending data or starting IP lookups.
 * Header order is intentionally flexible; recognized names determine each role.
 */
export function inspectCsvPattern(text) {
  const sourceLines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/)
    .map((value, index) => ({ value: value.trim(), lineNumber: index + 1 }))
    .filter(line => line.value && !line.value.startsWith('#'))

  const emptyResult = {
    format: 'empty', hasHeader: false, columns: [], previewRows: [], issues: [],
    dataRowCount: 0, validRowCount: 0, invalidRowCount: 0, recordCount: 0, canImport: false
  }
  if (!sourceLines.length) return emptyResult

  let firstCells
  try { firstCells = csvRow(sourceLines[0].value) }
  catch (error) {
    return { ...emptyResult, format: 'csv', issues: [{ type: 'csv_quote', row: sourceLines[0].lineNumber }], parseError: error.message }
  }

  const normalizedHeaders = firstCells.map(normalizeHeader)
  const recognizedHeader = normalizedHeaders.some(header => Object.values(COLUMN_ROLES).some(item => item.aliases.includes(header)))
  const headerLike = firstCells.length > 1 && firstCells.every(cell => !normalizeTarget(cell))
  const hasHeader = recognizedHeader || headerLike

  if (!hasHeader) {
    try {
      const records = parseTargetRecords(text)
      return { ...emptyResult, format: 'plain', dataRowCount: sourceLines.length, validRowCount: sourceLines.length, recordCount: records.length, canImport: records.length > 0 }
    } catch {
      return { ...emptyResult, format: 'plain', dataRowCount: sourceLines.length, invalidRowCount: sourceLines.length, issues: [{ type: 'invalid_plain_list' }] }
    }
  }

  const columns = firstCells.map((name, index) => ({
    index,
    name: name || `Column ${index + 1}`,
    normalizedName: normalizedHeaders[index],
    ...columnRole(name)
  }))
  const targetColumns = columns.filter(column => column.role === 'target')
  const probeColumns = columns.filter(column => column.role === 'probe')
  const targetIndex = targetColumns[0]?.index ?? -1
  const probeIndex = probeColumns[0]?.index ?? -1
  const issues = []
  if (targetIndex < 0) issues.push({ type: 'missing_target_header', row: sourceLines[0].lineNumber })
  if (targetColumns.length > 1) issues.push({ type: 'duplicate_target_header', row: sourceLines[0].lineNumber })
  if (probeColumns.length > 1) issues.push({ type: 'duplicate_probe_header', row: sourceLines[0].lineNumber })

  const parsedRows = []
  for (const sourceLine of sourceLines.slice(1)) {
    try {
      parsedRows.push({ cells: csvRow(sourceLine.value), lineNumber: sourceLine.lineNumber })
    } catch {
      parsedRows.push({ cells: [], lineNumber: sourceLine.lineNumber, parseError: true })
      issues.push({ type: 'csv_quote', row: sourceLine.lineNumber })
    }
  }

  let validRowCount = 0
  for (const row of parsedRows) {
    if (row.parseError) continue
    let rowValid = true
    if (row.cells.length > columns.length) {
      issues.push({ type: 'extra_columns', row: row.lineNumber })
      rowValid = false
    }
    const target = targetIndex >= 0 ? normalizeTarget(row.cells[targetIndex]) : ''
    if (targetIndex >= 0 && !target) {
      issues.push({ type: 'invalid_target', row: row.lineNumber })
      rowValid = false
    }
    const probeValue = probeIndex >= 0 ? String(row.cells[probeIndex] || '').trim() : ''
    if (probeValue) {
      try {
        const probeUrl = normalizeProbeUrl(probeValue)
        if (!target || !probeMatchesPoint({ target }, probeUrl)) {
          issues.push({ type: 'probe_mismatch', row: row.lineNumber })
          rowValid = false
        }
      } catch {
        issues.push({ type: 'invalid_probe', row: row.lineNumber })
        rowValid = false
      }
    }
    if (rowValid && targetIndex >= 0) validRowCount += 1
  }

  if (!parsedRows.length) issues.push({ type: 'no_data_rows', row: sourceLines[0].lineNumber })

  let recordCount = 0
  let canImport = false
  if (!issues.length) {
    try {
      const records = parseTargetRecords(text)
      recordCount = records.length
      canImport = records.length > 0
    } catch (error) {
      issues.push({ type: String(error?.message || '').includes('Maximum 200') ? 'too_many_entries' : 'import_error' })
      canImport = false
    }
  }
  const rowIssueNumbers = new Set(issues.filter(issue => issue.row > sourceLines[0].lineNumber).map(issue => issue.row))

  return {
    format: 'csv', hasHeader: true, columns,
    previewRows: parsedRows.slice(0, 3).map(row => ({
      lineNumber: row.lineNumber,
      cells: columns.map(column => row.cells[column.index] ?? ''),
      invalid: rowIssueNumbers.has(row.lineNumber)
    })),
    issues,
    dataRowCount: parsedRows.length,
    validRowCount,
    invalidRowCount: rowIssueNumbers.size,
    recordCount,
    canImport
  }
}

export function parseTargetRecords(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  if (!lines.length) return []
  const header = csvRow(lines[0]).map(normalizeHeader)
  const targetIndex = header.findIndex(value => TARGET_HEADERS.includes(value))
  const probeIndex = header.findIndex(value => PROBE_HEADERS.includes(value))
  const records = []
  if (targetIndex >= 0) {
    for (const line of lines.slice(1)) {
      const cells = csvRow(line)
      const target = normalizeTarget(cells[targetIndex])
      if (!target) throw new Error(`Invalid target: ${cells[targetIndex] || '(empty)'}`)
      const probeUrl = cells[probeIndex] ? normalizeProbeUrl(cells[probeIndex]) : ''
      if (probeUrl && !probeMatchesPoint({ target }, probeUrl)) throw new Error('Probe hostname must match its target column.')
      records.push({ target, probeUrl })
    }
  } else {
    for (const token of lines.join('\n').split(/[\s,;]+/)) {
      if (!token) continue
      const target = normalizeTarget(token.replace(/^['"]|['"]$/g, ''))
      if (!target) throw new Error(`Invalid target: ${token}`)
      records.push({ target, probeUrl:'' })
    }
  }
  const unique = new Map()
  for (const record of records) {
    if (!unique.has(record.target) || record.probeUrl) unique.set(record.target, record)
  }
  if (unique.size > 200) throw new Error('Maximum 200 unique entries per import.')
  return [...unique.values()]
}
