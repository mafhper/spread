#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs'
import path from 'path'

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

  // Handle both NPM and Bun audit formats
  const vulns = audit.vulnerabilities || audit.advisories || {}

  // Track counts
  let high = 0
  let critical = 0
  let moderate = 0
  let low = 0

  // Bun audit format (simple object with severity keys)
  if (
    audit.vulnerabilities &&
    typeof audit.vulnerabilities === 'object' &&
    !Array.isArray(audit.vulnerabilities)
  ) {
    // If it's the summary format from bun
    critical = audit.vulnerabilities.critical || 0
    high = audit.vulnerabilities.high || 0
    moderate = audit.vulnerabilities.moderate || 0
    low = audit.vulnerabilities.low || 0
  } else {
    // Standard NPM format or detailed Bun list
    for (const name in vulns) {
      // eslint-disable-next-line security/detect-object-injection
      const v = vulns[name]
      const severity = v.severity || (v.metadata && v.metadata.severity)

      if (severity === 'critical') critical++
      else if (severity === 'high') high++
      else if (severity === 'moderate') moderate++
      else if (severity === 'low') low++
    }
  }

  console.log(`Security audit summary for ${file}:`)
  console.log(`  Critical: ${critical}`)
  console.log(`  High:     ${high}`)
  console.log(`  Moderate: ${moderate}`)
  console.log(`  Low:      ${low}`)

  if (critical > 0 || high > 0) {
    console.error(`\nBlocking due to high/critical vulnerabilities in ${file}.`)
    process.exit(1)
  }

  console.log(`\nSecurity policy satisfied for ${file}.`)
} catch (err) {
  console.error(`Error parsing audit file: ${err.message}`)
  process.exit(1)
}
