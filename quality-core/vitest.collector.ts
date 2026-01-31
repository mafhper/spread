// quality-core/vitest.collector.ts
import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import type { TestMetrics, CoverageMetrics } from './quality-schema'

/**
 * VitestCollector executa os testes do projeto e extrai métricas.
 */
export class VitestCollector {
  private static REPORT_PATH = path.join(
    process.cwd(),
    'temp-vitest-report.json'
  )
  private static COVERAGE_PATH = path.join(
    process.cwd(),
    'coverage',
    'coverage-summary.json'
  )

  /**
   * Executa a suíte de testes e retorna as métricas.
   */
  static async collect(): Promise<{
    tests: TestMetrics
    coverage: CoverageMetrics
  }> {
    try {
      // Executa vitest com reporter JSON e coverage
      // Usamos --passWithNoTests para evitar erro se não houver testes
      const command = `bun vitest run --reporter=json --outputFile="${this.REPORT_PATH}" --coverage.enabled=true --coverage.reporter=json-summary --passWithNoTests`

      console.log(`[VitestCollector] Running: ${command}`)
      try {
        execSync(command, { stdio: 'pipe' })
      } catch (err) {
        // Vitest retorna exit code > 0 se houver falhas, mas o relatório ainda é gerado
        const execErr = err as { stdout?: unknown; stderr?: unknown }
        if (!execErr.stdout && !execErr.stderr) throw err
      }

      // 1. Parse Test Results
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const reportContent = await fs.readFile(this.REPORT_PATH, 'utf-8')
      const report = JSON.parse(reportContent)

      const tests: TestMetrics = {
        total: report.numTotalTests || 0,
        passed: report.numPassedTests || 0,
        failed: report.numFailedTests || 0,
        skipped: report.numPendingTests || 0,
        duration: Date.now() - (report.startTime || Date.now()),
        suites: [], // Podem ser mapeadas de report.testResults se necessário
      }

      // 2. Parse Coverage Results
      let coverage: CoverageMetrics = {
        lines: 0,
        statements: 0,
        branches: 0,
        functions: 0,
        trend: 'stable',
      }

      try {
        if (await this.fileExists(this.COVERAGE_PATH)) {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const coverageContent = await fs.readFile(this.COVERAGE_PATH, 'utf-8')
          const summary = JSON.parse(coverageContent)
          const total = summary.total

          if (total) {
            coverage = {
              lines: total.lines?.pct || 0,
              statements: total.statements?.pct || 0,
              branches: total.branches?.pct || 0,
              functions: total.functions?.pct || 0,
              trend: 'stable',
            }
          }
        }
      } catch (covErr) {
        console.warn(
          '[VitestCollector] Failed to parse coverage summary:',
          covErr
        )
      }

      // Cleanup
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(this.REPORT_PATH).catch(() => {})

      return { tests, coverage }
    } catch (err) {
      console.error('Failed to collect Vitest metrics:', err)
      return {
        tests: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          suites: [],
        },
        coverage: {
          lines: 0,
          statements: 0,
          branches: 0,
          functions: 0,
          trend: 'stable',
        },
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
