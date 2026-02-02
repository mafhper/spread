import { describe, it, expect } from 'vitest'
import { calculateHealthScore } from '../health-score'
import type {
  PerformanceMetrics,
  TestMetrics,
  CoverageMetrics,
  StabilityMetrics,
  QualitySnapshot,
} from '../quality-schema'

describe('health-score logic', () => {
  const mockPerformance: PerformanceMetrics = {
    lighthouse: {
      performance: 90,
      accessibility: 90,
      bestPractices: 90,
      seo: 90,
    },
    webVitals: { lcp: 1000, cls: 0.1, tbt: 100 },
    bundleSize: 300,
    regressions: [],
  }

  const mockTests: TestMetrics = {
    total: 100,
    passed: 100,
    failed: 0,
    skipped: 0,
    duration: 1000,
    suites: [],
  }

  const mockCoverage: CoverageMetrics = {
    lines: 90,
    statements: 90,
    branches: 90,
    functions: 90,
    trend: 'stable',
  }

  const mockStability: StabilityMetrics = {
    uptime: 100,
    latency: 50,
    lastCheck: new Date().toISOString(),
    status: 'online',
  }

  it('calculates a perfect score for perfect metrics', () => {
    const result = calculateHealthScore(
      {
        ...mockPerformance,
        lighthouse: { ...mockPerformance.lighthouse, performance: 100 },
      },
      mockTests,
      { ...mockCoverage, lines: 100, branches: 100, functions: 100 },
      mockStability
    )
    expect(result.score).toBe(100)
  })

  it('detects test failures', () => {
    const failingTests = { ...mockTests, passed: 90, failed: 10 }
    const result = calculateHealthScore(
      mockPerformance,
      failingTests,
      mockCoverage,
      mockStability
    )
    expect(result.score).toBeLessThan(100)
    expect(result.explanations.some(e => e.includes('failed'))).toBe(true)
  })

  it('detects coverage regressions', () => {
    const currentCoverage = { ...mockCoverage, lines: 70 }
    const previousSnapshot = {
      healthScore: 90,
      metrics: {
        coverage: { ...mockCoverage, lines: 90 },
        tests: mockTests,
        performance: mockPerformance,
        stability: mockStability,
      },
    } as unknown as QualitySnapshot

    const result = calculateHealthScore(
      mockPerformance,
      mockTests,
      currentCoverage,
      mockStability,
      previousSnapshot
    )

    expect(result.explanations.some(e => e.includes('Coverage dropped'))).toBe(
      true
    )
  })
})
