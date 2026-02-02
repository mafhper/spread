#!/usr/bin/env node
/* eslint-disable security/detect-non-literal-fs-filename, security/detect-object-injection */

/**
 * Script para validar o piloto de performance na homepage
 * Coleta métricas antes e depois das otimizações
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const RESULTS_DIR = '.lighthouseci'

async function runLighthouse(url, label) {
  console.log(`🔍 Running Lighthouse for ${label}...`)

  const outputFile = join(
    RESULTS_DIR,
    `${label.toLowerCase().replace(/\s+/g, '-')}.json`
  )

  try {
    execSync(
      `npx lighthouse "${url}" --output=json --output-path="${outputFile}" --chrome-flags="--headless" --emulated-form-factor=mobile`,
      {
        stdio: 'inherit',
      }
    )

    const report = JSON.parse(readFileSync(outputFile, 'utf8'))
    const metrics = {
      label,
      url,
      timestamp: new Date().toISOString(),
      performance: report.categories.performance.score * 100,
      fcp: report.audits['first-contentful-paint'].numericValue,
      lcp: report.audits['largest-contentful-paint'].numericValue,
      speedIndex: report.audits['speed-index'].numericValue,
      cls: report.audits['cumulative-layout-shift'].numericValue,
      inp: report.audits['interaction-to-next-paint'].numericValue,
      tti: report.audits['interactive'].numericValue,
    }

    console.log(`\n📊 ${label} Results:`)
    console.log(`   Performance Score: ${metrics.performance.toFixed(0)}`)
    console.log(`   FCP: ${(metrics.fcp / 1000).toFixed(2)}s`)
    console.log(`   LCP: ${(metrics.lcp / 1000).toFixed(2)}s`)
    console.log(`   Speed Index: ${(metrics.speedIndex / 1000).toFixed(2)}s`)
    console.log(`   CLS: ${metrics.cls.toFixed(3)}`)
    console.log(
      `   INP: ${metrics.inp ? metrics.inp.toFixed(0) + 'ms' : 'N/A'}`
    )
    console.log(`   TTI: ${(metrics.tti / 1000).toFixed(2)}s`)

    return metrics
  } catch (error) {
    console.error(`❌ Error running Lighthouse for ${label}:`, error.message)
    return null
  }
}

function checkTargets(metrics) {
  const targets = {
    performance: { min: 98, target: 100 },
    fcp: { max: 1000, target: 1000 }, // 1.0s
    lcp: { max: 1200, target: 1200 }, // 1.2s
    speedIndex: { max: 2000, target: 2000 }, // 2.0s
    cls: { max: 0.05, target: 0.05 },
    inp: { max: 200, target: 200 }, // 200ms
  }

  console.log('\n🎯 Target Validation:')
  let allPassed = true

  Object.entries(targets).forEach(([metric, { max, min, target }]) => {
    const value = metrics[metric]
    if (value === null || value === undefined) return

    let passed = true
    if (max !== undefined) passed = value <= max
    if (min !== undefined) passed = value >= min

    const status = passed ? '✅' : '❌'
    const display =
      metric === 'performance'
        ? value.toFixed(0)
        : metric === 'inp'
          ? `${value}ms`
          : metric === 'cls'
            ? value.toFixed(3)
            : `${(value / 1000).toFixed(2)}s`

    const targetDisplay = max ? `≤${max}` : min ? `≥${min}` : target
    console.log(
      `   ${status} ${metric.toUpperCase()}: ${display} (target: ${targetDisplay})`
    )

    if (!passed) allPassed = false
  })

  return allPassed
}

async function main() {
  console.log('🚀 Performance Pilot Validation')
  console.log('================================')

  // Ensure results directory exists
  try {
    execSync(`mkdir -p ${RESULTS_DIR}`)
  } catch {}

  const url = 'http://localhost:4321/'

  // Run Lighthouse and collect metrics
  const metrics = await runLighthouse(url, 'Homepage Optimized')

  if (!metrics) {
    console.error('\n❌ Failed to collect metrics')
    process.exit(1)
  }

  // Check if targets are met
  const targetsMet = checkTargets(metrics)

  // Save results
  const resultsPath = join(RESULTS_DIR, 'pilot-results.json')
  writeFileSync(resultsPath, JSON.stringify(metrics, null, 2))
  console.log(`\n💾 Results saved to: ${resultsPath}`)

  // Summary
  console.log('\n📋 Summary:')
  if (targetsMet) {
    console.log('   ✅ All performance targets achieved!')
    console.log('   🎉 Pilot ready for production rollout!')
  } else {
    console.log('   ⚠️  Some targets not met. Review optimizations.')
  }

  console.log('\n📈 Next Steps:')
  console.log('   1. Review LHCI results in PR checks')
  console.log('   2. Monitor real user metrics (RUM) after deployment')
  console.log('   3. Extend optimizations to other pages if pilot succeeds')
}

main().catch(console.error)
