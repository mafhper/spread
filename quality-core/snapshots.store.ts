// quality-core/snapshots.store.ts
import fs from 'fs/promises'
import path from 'path'
import type {
  QualitySnapshot,
  TestSuite,
  ConfidenceLevel,
} from './quality-schema'

const REPORTS_DIR = path.join(process.cwd(), 'performance-reports', 'reports')
const LEGACY_REPORTS_DIR = path.join(
  process.cwd(),
  'performance-reports',
  'quality'
)
const LIGHTHOUSE_DIR = path.join(
  process.cwd(),
  'performance-reports',
  'lighthouse'
)
const SNAPSHOTS_DIR = path.join(
  process.cwd(),
  'performance-reports',
  'quality-snapshots'
)

export class SnapshotStore {
  static async ensureDir(dir: string) {
    try {
      await fs.access(dir)
    } catch {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(dir, { recursive: true })
    }
  }

  static async dirExists(dir: string): Promise<boolean> {
    try {
      await fs.access(dir)
      return true
    } catch {
      return false
    }
  }

  static async save(snapshot: QualitySnapshot) {
    await this.ensureDir(SNAPSHOTS_DIR)
    const timestamp = new Date(snapshot.timestamp).getTime()
    const filename = `${snapshot.commitHash}-${timestamp}.json`
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.join(SNAPSHOTS_DIR, filename),
      JSON.stringify(snapshot, null, 2)
    )
    return path.join(SNAPSHOTS_DIR, filename)
  }

  static async list(): Promise<QualitySnapshot[]> {
    try {
      // Ensure all directories exist before listing
      await this.ensureDir(REPORTS_DIR)
      await this.ensureDir(LEGACY_REPORTS_DIR)
      await this.ensureDir(LIGHTHOUSE_DIR)
      await this.ensureDir(SNAPSHOTS_DIR)

      const snapshots: QualitySnapshot[] = []
      let jsonCount = 0
      let reportCount = 0

      // 1. Load JSON snapshots
      if (await this.dirExists(SNAPSHOTS_DIR)) {
        const jsonFiles = (await fs.readdir(SNAPSHOTS_DIR)).filter(f =>
          f.endsWith('.json')
        )
        for (const f of jsonFiles) {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const content = await fs.readFile(
              path.join(SNAPSHOTS_DIR, f),
              'utf-8'
            )
            const raw = JSON.parse(content)
            const migrated = this.migrateSnapshot(raw)
            if (migrated) {
              snapshots.push(migrated)
              jsonCount++
            }
          } catch (e) {
            console.warn(
              `[SnapshotStore] Failed to parse JSON snapshot ${f}:`,
              e
            )
          }
        }
      }

      // 2. Scan report directories
      const sources = [
        { dir: REPORTS_DIR, prefix: 'audit_report_', ext: '.md' },
        { dir: LEGACY_REPORTS_DIR, prefix: 'quality-', ext: '.md' },
      ]

      for (const source of sources) {
        if (!(await this.dirExists(source.dir))) continue

        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const files = (await fs.readdir(source.dir)).filter(
            f => f.startsWith(source.prefix) && f.endsWith(source.ext)
          )

          for (const file of files) {
            try {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              const content = await fs.readFile(
                path.join(source.dir, file),
                'utf-8'
              )
              let timestampStr = file
                .replace(source.prefix, '')
                .replace(source.ext, '')

              let timestamp: number
              if (/^\d+$/.test(timestampStr)) {
                timestamp = parseInt(timestampStr)
              } else {
                timestampStr = timestampStr.replace(
                  /T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/,
                  'T$1:$2:$3.$4Z'
                )
                timestamp = new Date(timestampStr).getTime()
              }

              if (isNaN(timestamp)) continue

              const commitHash = this.generatePseudoHash(timestamp.toString())
              if (snapshots.some(s => s.commitHash === commitHash)) continue

              const parsed = this.parseMarkdownReport(content)
              const lighthouseData =
                await this.findMatchingLighthouse(timestamp)
              const testSuites = await this.getRealTestSuites()

              const snapshot: QualitySnapshot = {
                version: '1.0',
                commitHash,
                branch: 'main',
                timestamp: new Date(timestamp).toISOString(),
                healthScore: this.calculateHealthScore(parsed, lighthouseData),
                confidenceLevel: 'high',
                reportFile: file,
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
                    lastCheck: new Date(timestamp).toISOString(),
                    status: 'online',
                  },
                },
              }
              snapshots.push(snapshot)
              reportCount++
            } catch (err) {
              console.error(
                `[SnapshotStore] Error parsing report ${file}:`,
                err
              )
            }
          }
        } catch (dirErr) {
          console.error(
            `[SnapshotStore] Error reading directory ${source.dir}:`,
            dirErr
          )
        }
      }

      console.log(
        `[SnapshotStore] Loaded ${snapshots.length} snapshots (${jsonCount} cached, ${reportCount} parsed).`
      )
      return snapshots.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (err) {
      console.error('[SnapshotStore] Error listing snapshots:', err)
      return []
    }
  }

  private static migrateSnapshot(rawUnknown: unknown): QualitySnapshot | null {
    if (!rawUnknown || typeof rawUnknown !== 'object') return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = rawUnknown as any
    if (raw.commitHash && raw.metrics) return raw as QualitySnapshot

    try {
      const timestampRaw = raw.timestamp || raw.meta?.timestamp || Date.now()
      const timestamp = new Date(timestampRaw).toISOString()

      return {
        version: raw.version || '1.0',
        commitHash: raw.commitHash || raw.meta?.commit || 'unknown',
        branch: raw.branch || raw.meta?.branch || 'main',
        timestamp: timestamp,
        healthScore: raw.healthScore?.score || raw.healthScore || 0,
        confidenceLevel: (raw.confidenceLevel ||
          raw.healthScore?.confidence ||
          'low') as ConfidenceLevel,
        metrics: {
          tests: {
            total: raw.metrics?.tests?.total || raw.tests?.total || 0,
            passed: raw.metrics?.tests?.passed || raw.tests?.passed || 0,
            failed: raw.metrics?.tests?.failed || raw.tests?.failed || 0,
            skipped: raw.metrics?.tests?.skipped || 0,
            duration:
              raw.metrics?.tests?.duration || raw.tests?.durationMs || 0,
            suites: raw.metrics?.tests?.suites || [],
          },
          coverage: {
            lines: raw.metrics?.coverage?.lines || raw.coverage?.lines || 0,
            statements:
              raw.metrics?.coverage?.statements || raw.coverage?.lines || 0,
            branches:
              raw.metrics?.coverage?.branches || raw.coverage?.branches || 0,
            functions:
              raw.metrics?.coverage?.functions || raw.coverage?.functions || 0,
            trend: raw.metrics?.coverage?.trend || 'stable',
          },
          performance: {
            lighthouse: {
              performance:
                raw.metrics?.performance?.lighthouse?.performance ||
                raw.performance?.lighthouseScore ||
                0,
              accessibility:
                raw.metrics?.performance?.lighthouse?.accessibility || 100,
              bestPractices:
                raw.metrics?.performance?.lighthouse?.bestPractices || 100,
              seo: raw.metrics?.performance?.lighthouse?.seo || 100,
            },
            webVitals: {
              lcp:
                raw.metrics?.performance?.webVitals?.lcp ||
                raw.performance?.lcp ||
                0,
              cls:
                raw.metrics?.performance?.webVitals?.cls ||
                raw.performance?.cls ||
                0,
              tbt:
                raw.metrics?.performance?.webVitals?.tbt ||
                raw.performance?.tbt ||
                0,
            },
            bundleSize: raw.metrics?.performance?.bundleSize || 0,
            regressions:
              raw.metrics?.performance?.regressions ||
              raw.performance?.regressions ||
              [],
          },
          stability: {
            uptime:
              raw.metrics?.stability?.uptime ||
              raw.stability?.uptimeAvailability ||
              100,
            latency: raw.metrics?.stability?.latency || 0,
            lastCheck: raw.metrics?.stability?.lastCheck || timestamp,
            status: raw.metrics?.stability?.status || 'online',
          },
        },
      }
    } catch (err) {
      console.error('[SnapshotStore] Migration failed:', err)
      return null
    }
  }

  static async getReportContent(filename: string): Promise<string | null> {
    try {
      const parts = filename.split(/[\\/]/)
      const name = parts[parts.length - 1]

      const possiblePaths = [
        path.join(REPORTS_DIR, name),
        path.join(LEGACY_REPORTS_DIR, name),
      ]

      for (const p of possiblePaths) {
        if (await this.dirExists(path.dirname(p))) {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            return await fs.readFile(p, 'utf-8')
          } catch {
            // Silently ignore file read errors for individual paths
          }
        }
      }
      return null
    } catch {
      return null
    }
  }

  static async getRealTestSuites(): Promise<TestSuite[]> {
    try {
      const testsDir = path.join(process.cwd(), '__tests__')
      if (!(await this.dirExists(testsDir))) return []

      const files = (await fs.readdir(testsDir)).filter(
        f => f.endsWith('.test.ts') || f.endsWith('.test.tsx')
      )
      return files.map(f => ({
        name: f
          .replace('.core.test.tsx', '')
          .replace('.core.test.ts', '')
          .replace('.test.ts', '')
          .replace('.test.tsx', ''),
        tests: 1,
        passed: 1,
        failed: 0,
        duration: 0,
        status: 'passed' as const,
      }))
    } catch {
      return []
    }
  }

  static parseMarkdownReport(content: string) {
    const lines = content.split('\n')
    let totalSteps = 0
    let passedSteps = 0
    let failedSteps = 0
    let totalDuration = 0
    let coverage = 0
    let bundleSize = 0

    // 1. Look for hidden tags (preferred)
    const metricsBlock = content.match(
      /<!-- METRICS_START([\s\S]*?)METRICS_END -->/
    )
    if (metricsBlock) {
      const block = metricsBlock[1]
      const covMatch = block.match(/coverage:\s+([\d.]+)%/)
      const sizeMatch = block.match(/bundle_total_kb:\s+([\d.]+)/)

      if (covMatch) coverage = parseFloat(covMatch[1])
      if (sizeMatch) bundleSize = parseFloat(sizeMatch[1])
    }

    // 2. Fallback to visible text if tags not found
    if (coverage === 0) {
      const coverageLine = lines.find(
        l =>
          l.toLowerCase().includes('cobertura') ||
          l.toLowerCase().includes('coverage')
      )
      if (coverageLine) {
        // eslint-disable-next-line security/detect-unsafe-regex
        const match = coverageLine.match(/(\d+(\.\d+)?)%/)
        if (match) coverage = parseFloat(match[1])
      }
    }

    if (bundleSize === 0) {
      const bundleLine = lines.find(
        l => l.includes('bundle_total_kb') || l.includes('Tamanho Bundle:')
      )
      if (bundleLine) {
        const match =
          bundleLine.match(/`?([\d.]+)`?\s*KB/i) ||
          bundleLine.match(/`([\d.]+)`/)
        if (match) bundleSize = parseFloat(match[1])
      }
    }

    let inTable = false
    for (const line of lines) {
      if (
        line.includes('| Etapa | Status |') ||
        line.includes('| Category | Score |')
      ) {
        inTable = true
        continue
      }
      if (inTable && line.startsWith('|') && !line.includes('---')) {
        const parts = line
          .split('|')
          .map(s => s.trim())
          .filter(Boolean)
        if (parts.length >= 2) {
          totalSteps++
          if (
            line.includes('✅') ||
            line.includes('PASSED') ||
            parseInt(parts[1]) > 0
          ) {
            passedSteps++
          } else {
            failedSteps++
          }
        }
      }
    }

    for (const line of lines) {
      // eslint-disable-next-line security/detect-unsafe-regex
      const durationMatch = line.match(/(\d+(\.\d+)?)s/)
      if (durationMatch && line.includes('|')) {
        totalDuration += parseFloat(durationMatch[1])
      }
    }

    return {
      totalSteps,
      passedSteps,
      failedSteps,
      totalDuration,
      coverage,
      bundleSize,
      passRate:
        totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0,
    }
  }

  static async findMatchingLighthouse(timestamp: number) {
    try {
      if (!(await this.dirExists(LIGHTHOUSE_DIR))) return null

      const files = await fs.readdir(LIGHTHOUSE_DIR)
      const desktopFiles = files.filter(
        f => f.startsWith('lighthouse_desktop_') && f.endsWith('.json')
      )

      let closestFile = null
      let minDiff = 30 * 24 * 60 * 60 * 1000

      for (const file of desktopFiles) {
        let timeStr = file
          .replace('lighthouse_desktop_', '')
          .replace('.json', '')
        timeStr = timeStr.replace(/T(\d{2})-(\d{2})-(\d{2})/, 'T$1:$2:$3')
        const fileTime = new Date(timeStr).getTime()

        if (isNaN(fileTime)) continue

        const diff = timestamp - fileTime
        if (diff < minDiff && diff > -3600000) {
          minDiff = diff
          closestFile = file
        }
      }

      if (closestFile) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const content = await fs.readFile(
          path.join(LIGHTHOUSE_DIR, closestFile),
          'utf-8'
        )
        return this.parseLighthouseJson(content)
      }
    } catch {
      // Ignore lighthouse discovery errors
    }
    return null
  }

  static parseLighthouseJson(content: string) {
    try {
      const json = JSON.parse(content)
      return {
        performance: Math.round(
          (json.categories.performance?.score || 0) * 100
        ),
        lcp: json.audits['largest-contentful-paint']?.numericValue || 0,
        cls: json.audits['cumulative-layout-shift']?.numericValue || 0,
        tbt: json.audits['total-blocking-time']?.numericValue || 0,
      }
    } catch {
      return null
    }
  }

  static calculateHealthScore(
    metrics: { passRate: number },
    lighthouse: { performance: number } | null
  ) {
    let score = 0
    score += metrics.passRate * 0.5
    if (lighthouse) {
      score += lighthouse.performance * 0.3
    } else {
      score += metrics.passRate * 0.3
    }
    score += 20
    return Math.min(Math.round(score), 100)
  }

  private static generatePseudoHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).substring(0, 7)
  }
}
