import {
  FlaskConical,
  Gauge,
  FileCode,
  Package,
  AlertTriangle,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ScoreBreakdown } from '@/components/dashboard/ScoreBreakdown'
import { LighthouseCard } from '@/components/dashboard/LighthouseCard'
import { TestSuiteList } from '@/components/dashboard/TestSuiteList'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { CommitTimeline } from '@/components/dashboard/CommitTimeline'
import { SystemStatus } from '@/components/dashboard/SystemStatus'
import { useQualityData } from '@/contexts/QualityDataContext'
import { Button } from '@/components/ui/button'
import { getCategoryScores, getScoreStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const {
    currentSnapshot,
    historicalData,
    recentCommits,
    isLoading,
    error,
    openReport,
    searchQuery,
  } = useQualityData()

  console.log('[dashboard-debug] Renderizando Dashboard. State:', {
    isLoading,
    hasError: !!error,
    hasSnapshot: !!currentSnapshot,
    commit: currentSnapshot?.commitHash,
    searchQuery,
    testData: {
      total: currentSnapshot?.metrics?.tests?.total,
      passed: currentSnapshot?.metrics?.tests?.passed,
      failed: currentSnapshot?.metrics?.tests?.failed,
    },
    healthScore: currentSnapshot?.healthScore,
  })

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando métricas de qualidade...
        </p>
      </div>
    )
  }

  if (error || !currentSnapshot) {
    console.warn('[dashboard-debug] Estado de erro ou snapshot ausente:', {
      error,
      currentSnapshot,
    })
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold">Erro ao carregar dados</h3>
        <p className="text-muted-foreground max-w-md">
          {error ||
            'Não foi possível encontrar snapshots de qualidade. Execute os testes para gerar novos relatórios.'}
        </p>
      </div>
    )
  }

  console.log(
    '[dashboard-debug] Calculando scores para commit:',
    currentSnapshot.commitHash
  )
  const categoryScores = getCategoryScores(currentSnapshot)
  const scoreStatus = getScoreStatus(currentSnapshot.healthScore)
  const previousScore = recentCommits[1]?.healthScore || 0

  // Trend calculations
  const prevSnapshot = historicalData[historicalData.length - 2]
  const calculateTrend = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null
    return current - previous
  }

  const lcpTrend = calculateTrend(
    currentSnapshot.metrics.performance.webVitals.lcp,
    prevSnapshot?.lcp
  )
  const clsTrend = calculateTrend(
    currentSnapshot.metrics.performance.webVitals.cls,
    prevSnapshot?.cls
  )
  const tbtTrend = calculateTrend(
    currentSnapshot.metrics.performance.webVitals.tbt,
    prevSnapshot?.tbt
  )

  // Calculate metric trends for small cards
  const testTrend = prevSnapshot
    ? currentSnapshot.metrics.tests.passed - prevSnapshot.tests.passed
    : null
  const coverageTrend = prevSnapshot
    ? currentSnapshot.metrics.coverage.lines - prevSnapshot.coverage
    : null
  const bundleTrend = prevSnapshot
    ? currentSnapshot.metrics.performance.bundleSize - prevSnapshot.bundleSize
    : null
  const performanceTrend = prevSnapshot
    ? currentSnapshot.metrics.performance.lighthouse.performance -
      prevSnapshot.performance
    : null

  // Search logic
  const query = searchQuery?.toLowerCase() || ''

  // Filter test suites
  const filteredSuites = query
    ? currentSnapshot.metrics.tests.suites.filter(s =>
        s.name.toLowerCase().includes(query)
      )
    : currentSnapshot.metrics.tests.suites

  // Show/Hide metrics based on search
  const showTests =
    !query ||
    'testes tests'.includes(query) ||
    `${currentSnapshot.metrics.tests.passed}/${currentSnapshot.metrics.tests.total}`.includes(
      query
    )
  const showPerformance =
    !query || 'performance lighthouse score'.includes(query)
  const showCoverage = !query || 'cobertura coverage lines'.includes(query)
  const showBundle = !query || 'bundle size build tamanho'.includes(query)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visão Geral</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Centro de comando do Quality Core • Commit:{' '}
            <code className="text-primary">
              {currentSnapshot.commitHash.substring(0, 7)}
            </code>
          </p>
        </div>
        {currentSnapshot.reportFile && (
          <Button
            variant="outline"
            className="gap-2 self-start sm:self-center"
            onClick={() =>
              currentSnapshot.reportFile &&
              openReport(currentSnapshot.reportFile)
            }
          >
            <FileText className="h-4 w-4" />
            Ver Relatório Completo
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Health Score & Breakdown */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <HealthScoreCard
            score={currentSnapshot.healthScore}
            previousScore={previousScore}
            confidenceLevel={currentSnapshot.confidenceLevel}
            status={scoreStatus}
          />
          <ScoreBreakdown {...categoryScores} />
        </div>

        {/* Center Column - Quick Metrics & Trend */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 stagger-children">
            {showTests && (
              <MetricCard
                title="Testes"
                value={`${currentSnapshot.metrics.tests.passed}/${currentSnapshot.metrics.tests.total}`}
                subtitle={`${currentSnapshot.metrics.tests.failed} falhas`}
                icon={FlaskConical}
                status={
                  currentSnapshot.metrics.tests.failed === 0
                    ? 'success'
                    : 'error'
                }
                trend={
                  testTrend !== null
                    ? { value: testTrend, isPositive: testTrend >= 0 }
                    : undefined
                }
                reportFile={currentSnapshot.reportFile}
                onOpenReport={openReport}
              />
            )}
            {showPerformance && (
              <MetricCard
                title="Performance"
                value={Math.round(
                  currentSnapshot.metrics.performance.lighthouse.performance
                )}
                subtitle="Lighthouse Score"
                icon={Gauge}
                status={
                  currentSnapshot.metrics.performance.lighthouse.performance >=
                  90
                    ? 'success'
                    : 'warning'
                }
                trend={
                  performanceTrend !== null
                    ? {
                        value: performanceTrend,
                        isPositive: performanceTrend >= 0,
                      }
                    : undefined
                }
                reportFile={currentSnapshot.reportFile}
                onOpenReport={openReport}
              />
            )}
            {showCoverage && (
              <MetricCard
                title="Cobertura"
                value={`${currentSnapshot.metrics.coverage.lines.toFixed(1)}%`}
                subtitle="Linhas cobertas"
                icon={FileCode}
                status={
                  currentSnapshot.metrics.coverage.lines >= 80
                    ? 'success'
                    : 'warning'
                }
                trend={
                  coverageTrend !== null
                    ? {
                        value: parseFloat(coverageTrend.toFixed(1)),
                        isPositive: coverageTrend >= 0,
                      }
                    : undefined
                }
                reportFile={currentSnapshot.reportFile}
                onOpenReport={openReport}
              />
            )}
            {showBundle && (
              <MetricCard
                title="Bundle Size"
                value={
                  currentSnapshot.metrics.performance.bundleSize > 0
                    ? `${currentSnapshot.metrics.performance.bundleSize.toFixed(1)}KB`
                    : 'N/A'
                }
                subtitle="Tamanho do build"
                icon={Package}
                status={
                  currentSnapshot.metrics.performance.bundleSize <= 350
                    ? 'success'
                    : 'warning'
                }
                trend={
                  bundleTrend !== null
                    ? { value: bundleTrend, isPositive: bundleTrend <= 0 }
                    : undefined
                }
                reportFile={currentSnapshot.reportFile}
                onOpenReport={openReport}
              />
            )}
          </div>

          {/* Trend Chart */}
          <TrendChart
            data={historicalData}
            metrics={['healthScore', 'performance', 'coverage']}
          />

          {/* Lighthouse Scores */}
          <LighthouseCard
            scores={currentSnapshot.metrics.performance.lighthouse}
          />
        </div>

        {/* Right Column - Timeline & Status */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <SystemStatus stability={currentSnapshot.metrics.stability} />
          <CommitTimeline commits={recentCommits} />
        </div>
      </div>

      {/* Bottom Section - Test Suites */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TestSuiteList
            suites={filteredSuites}
            totalDuration={currentSnapshot.metrics.tests.duration}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          {/* Core Web Vitals */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Core Web Vitals
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    LCP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Largest Contentful Paint
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-success">
                    {currentSnapshot.metrics.performance.webVitals.lcp.toFixed(
                      0
                    )}
                    ms
                  </div>
                  {lcpTrend !== null && (
                    <div
                      className={cn(
                        'text-[10px] flex items-center justify-end gap-0.5',
                        lcpTrend > 0 ? 'text-error' : 'text-success'
                      )}
                    >
                      {lcpTrend > 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {Math.abs(lcpTrend).toFixed(0)}ms
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    CLS
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cumulative Layout Shift
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-success">
                    {currentSnapshot.metrics.performance.webVitals.cls.toFixed(
                      3
                    )}
                  </div>
                  {clsTrend !== null && (
                    <div
                      className={cn(
                        'text-[10px] flex items-center justify-end gap-0.5',
                        clsTrend > 0 ? 'text-error' : 'text-success'
                      )}
                    >
                      {clsTrend > 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {Math.abs(clsTrend).toFixed(3)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    TBT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Blocking Time
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-success">
                    {Math.round(
                      currentSnapshot.metrics.performance.webVitals.tbt
                    )}
                    ms
                  </div>
                  {tbtTrend !== null && (
                    <div
                      className={cn(
                        'text-[10px] flex items-center justify-end gap-0.5',
                        tbtTrend > 0 ? 'text-error' : 'text-success'
                      )}
                    >
                      {tbtTrend > 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {Math.round(Math.abs(tbtTrend))}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
