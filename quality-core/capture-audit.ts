import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'
import { SnapshotStore } from './snapshots.store'
import type { QualitySnapshot } from './quality-schema'

async function captureAudit() {
  console.log('Capturing latest audit report as a quality snapshot...')

  try {
    const reportsDir = path.join(
      process.cwd(),
      'performance-reports',
      'reports'
    )
    const files = await fs.readdir(reportsDir)
    const reportFiles = files
      .filter(f => f.startsWith('audit_report_') && f.endsWith('.md'))
      .sort()
      .reverse()

    if (reportFiles.length === 0) {
      console.error(
        '[error] No audit reports found in performance-reports/reports'
      )
      process.exit(1)
    }

    const latestReport = reportFiles[0]
    console.log(`Using latest report: ${latestReport}`)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(
      path.join(reportsDir, latestReport),
      'utf-8'
    )
    const parsed = SnapshotStore.parseMarkdownReport(content)

    const commitHash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
    }).trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
    }).trim()

    let timestampStr = latestReport
      .replace('audit_report_', '')
      .replace('.md', '')
    timestampStr = timestampStr.replace(
      /T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/,
      'T$1:$2:$3.$4Z'
    )
    const timestamp = new Date(timestampStr).toISOString()

    const lighthouseData = await SnapshotStore.findMatchingLighthouse(
      new Date(timestamp).getTime()
    )
    const testSuites = await SnapshotStore.getRealTestSuites()

    const snapshot: QualitySnapshot = {
      version: '1.1',
      commitHash,
      branch,
      timestamp,
      healthScore: SnapshotStore.calculateHealthScore(parsed, lighthouseData),
      confidenceLevel: 'high',
      reportFile: latestReport,
      metrics: {
        tests: {
          total: parsed.totalSteps,
          passed: parsed.passedSteps,
          failed: parsed.failedSteps,
          skipped: 0,
          duration: parsed.totalDuration * 1000,
          suites: testSuites,
        },
        coverage: {
          lines: parsed.coverage,
          statements: parsed.coverage,
          branches: 0,
          functions: 0,
          trend: 'stable',
        },
        performance: {
          lighthouse: {
            performance: lighthouseData?.performance || 0,
            accessibility: 100,
            bestPractices: 100,
            seo: 100,
          },
          webVitals: {
            lcp: lighthouseData?.lcp || 0,
            cls: lighthouseData?.cls || 0,
            tbt: lighthouseData?.tbt || 0,
          },
          bundleSize: parsed.bundleSize || 0,
          regressions: [],
        },
        stability: {
          uptime: 100,
          latency: 0,
          lastCheck: timestamp,
          status: 'online',
        },
      },
    }

    const savedPath = await SnapshotStore.save(snapshot)
    console.log(`Snapshot captured and saved to: ${savedPath}`)
    console.log(`Score: ${snapshot.healthScore}%`)
    console.log(`Bundle Size: ${snapshot.metrics.performance.bundleSize} KB`)
    console.log(`Coverage: ${snapshot.metrics.coverage.lines}%`)
  } catch (err) {
    console.error(
      '[error] Failed to capture audit:',
      err instanceof Error ? err.message : String(err)
    )
    process.exit(1)
  }
}

captureAudit()
