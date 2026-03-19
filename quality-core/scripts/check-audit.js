#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs'
import path from 'path'

const SUMMARY_KEYS = ['critical', 'high', 'moderate', 'low']

function addSeverity(counts, severity) {
  if (severity === 'critical') counts.critical += 1
  else if (severity === 'high') counts.high += 1
  else if (severity === 'moderate') counts.moderate += 1
  else if (severity === 'low') counts.low += 1
}

function hasSummaryShape(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return SUMMARY_KEYS.some(key => typeof value[key] === 'number')
}

function countPackageEntries(counts, entries) {
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const severity = entry.severity || entry.metadata?.severity
    addSeverity(counts, severity)
  }
}

const file = process.argv[2]
if (!file) {
  console.error('Missing audit JSON file path')
  process.exit(1)
}

const auditPath = path.resolve(process.cwd(), file)
if (!fs.existsSync(auditPath)) {
  console.error(`Audit file not found: ${auditPath}`)
  process.exit(1)
}

try {
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
  const counts = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
  }

  if (hasSummaryShape(audit.metadata?.vulnerabilities)) {
    counts.critical = audit.metadata.vulnerabilities.critical || 0
    counts.high = audit.metadata.vulnerabilities.high || 0
    counts.moderate = audit.metadata.vulnerabilities.moderate || 0
    counts.low = audit.metadata.vulnerabilities.low || 0
  } else if (hasSummaryShape(audit.vulnerabilities)) {
    counts.critical = audit.vulnerabilities.critical || 0
    counts.high = audit.vulnerabilities.high || 0
    counts.moderate = audit.vulnerabilities.moderate || 0
    counts.low = audit.vulnerabilities.low || 0
  } else if (
    audit.vulnerabilities &&
    typeof audit.vulnerabilities === 'object' &&
    !Array.isArray(audit.vulnerabilities)
  ) {
    countPackageEntries(counts, Object.values(audit.vulnerabilities))
  } else if (audit.advisories && typeof audit.advisories === 'object') {
    countPackageEntries(counts, Object.values(audit.advisories))
  } else {
    const packageEntries = Object.entries(audit).filter(
      ([name]) => !['auditReportVersion', 'metadata', 'error'].includes(name)
    )

    for (const [, advisories] of packageEntries) {
      if (Array.isArray(advisories)) {
        countPackageEntries(counts, advisories)
      } else if (advisories && typeof advisories === 'object') {
        countPackageEntries(counts, [advisories])
      }
    }
  }

  console.log(`Security audit summary for ${file}:`)
  console.log(`  Critical: ${counts.critical}`)
  console.log(`  High:     ${counts.high}`)
  console.log(`  Moderate: ${counts.moderate}`)
  console.log(`  Low:      ${counts.low}`)

  if (counts.critical > 0 || counts.high > 0) {
    console.error(`\nBlocking due to high/critical vulnerabilities in ${file}.`)
    process.exit(1)
  }

  console.log(`\nSecurity policy satisfied for ${file}.`)
} catch (err) {
  console.error(`Error parsing audit file: ${err.message}`)
  process.exit(1)
}
