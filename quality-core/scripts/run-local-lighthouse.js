#!/usr/bin/env node

/**
 * Script para executar Lighthouse localmente
 * Uso: node scripts/run-local-lighthouse.js [url]
 * Padrão: http://localhost:4321/
 */

import { execSync } from 'child_process'
import { join } from 'path'

const url = process.argv[2] || 'http://localhost:4321/'
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const outputFile = join('lighthouse-reports', `report-${timestamp}.json`)

console.log(`🔍 Running Lighthouse on: ${url}`)
console.log(`📄 Report will be saved to: ${outputFile}`)

// Create reports directory
try {
  execSync('mkdir -p lighthouse-reports')
} catch {}

try {
  // Run Lighthouse
  execSync(
    `npx lighthouse "${url}" --output=json --output-path="${outputFile}" --chrome-flags="--headless" --emulated-form-factor=mobile`,
    {
      stdio: 'inherit',
    }
  )

  console.log('\n✅ Lighthouse completed successfully!')
  console.log(`📊 Open the report: npx lighthouse-viewer ${outputFile}`)
} catch (error) {
  console.error('\n❌ Error running Lighthouse:', error.message)
  process.exit(1)
}
