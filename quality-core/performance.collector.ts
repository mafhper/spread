// quality-core/performance.collector.ts
import fs from 'fs/promises'
import path from 'path'
import { SnapshotStore } from './snapshots.store'
import type { PerformanceMetrics } from './quality-schema'

/**
 * PerformanceCollector busca métricas reais de Lighthouse e Analysis.
 */
export class PerformanceCollector {
  private static ANALYSIS_PATH = path.join(
    process.cwd(),
    'performance-reports',
    'analysis',
    'analysis-latest.json'
  )

  private static QUALITY_PATH = path.join(
    process.cwd(),
    'performance-reports',
    'quality',
    'quality-latest.json'
  )

  /**
   * Coleta métricas de performance dos relatórios mais recentes.
   */
  static async collect(): Promise<PerformanceMetrics> {
    try {
      // 1. Métricas padrão (fallback)
      const metrics: PerformanceMetrics = {
        lighthouse: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
        },
        webVitals: {
          lcp: 0,
          cls: 0,
          tbt: 0,
        },
        bundleSize: 0,
        regressions: [],
      }

      // 2. Tentar buscar Lighthouse recente via SnapshotStore
      const latestLighthouse = await SnapshotStore.findMatchingLighthouse(
        Date.now()
      )
      if (latestLighthouse) {
        metrics.lighthouse.performance = latestLighthouse.performance
        metrics.lighthouse.accessibility = latestLighthouse.accessibility || 0
        metrics.lighthouse.bestPractices = latestLighthouse.bestPractices || 0
        metrics.lighthouse.seo = latestLighthouse.seo || 0
        metrics.webVitals.lcp = latestLighthouse.lcp
        metrics.webVitals.cls = latestLighthouse.cls
        metrics.webVitals.tbt = latestLighthouse.tbt
      } else {
        console.warn(
          '[PerformanceCollector] No recent lighthouse report found.'
        )
      }

      // 3. Tentar buscar Bundle Analysis (Detailed)
      if (await this.fileExists(this.ANALYSIS_PATH)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const analysisContent = await fs.readFile(this.ANALYSIS_PATH, 'utf-8')
        const analysis = JSON.parse(analysisContent)

        if (analysis.bundle && analysis.bundle.metrics) {
          metrics.bundleSize = analysis.bundle.metrics.bundleTotalKb || 0
        }
      } else if (await this.fileExists(this.QUALITY_PATH)) {
        // Fallback to basic quality audit for bundle size
        console.log(
          '[PerformanceCollector] Using basic quality audit fallback for bundle size'
        )
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const qualityContent = await fs.readFile(this.QUALITY_PATH, 'utf-8')
        const quality = JSON.parse(qualityContent)

        // Find 'build' audit in results
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildAudit = quality.results?.find((r: any) => r.name === 'build')
        if (buildAudit && buildAudit.raw) {
          const js = parseFloat(buildAudit.raw.jsTotal || '0')
          const css = parseFloat(buildAudit.raw.cssTotal || '0')
          metrics.bundleSize = js + css
        }
      } else {
        console.warn(
          '[PerformanceCollector] No bundle analysis or quality report found.'
        )
      }

      return metrics
    } catch (err) {
      console.error(
        '[PerformanceCollector] Failed to collect performance metrics:',
        err
      )
      return {
        lighthouse: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
        },
        webVitals: { lcp: 0, cls: 0, tbt: 0 },
        bundleSize: 0,
        regressions: [],
      }
    }
  }

  private static async fileExists(p: string): Promise<boolean> {
    try {
      await fs.access(p)
      return true
    } catch {
      return false
    }
  }
}
