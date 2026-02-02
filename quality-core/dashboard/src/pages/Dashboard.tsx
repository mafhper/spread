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

  // Show/Hide metrics based on search - ALWAYS SHOW in dashboard, use global search for filtering
  const showTests = true
  const showPerformance = true
  const showCoverage = true
  const showBundle = true

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Global Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Visão Geral
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Centro de comando do Quality Core • Commit:{' '}
            <code className="text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded">
              {currentSnapshot.commitHash.substring(0, 7)}
            </code>
          </p>
        </div>
        {currentSnapshot.reportFile && (
          <Button
            variant="outline"
            className="gap-2 self-start sm:self-center shadow-sm"
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

      {/* Row 1: Symmetrical KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Testes"
          value={`${currentSnapshot.metrics.tests.passed}/${currentSnapshot.metrics.tests.total}`}
          subtitle={`${currentSnapshot.metrics.tests.failed} falhas`}
          icon={FlaskConical}
          status={
            currentSnapshot.metrics.tests.failed === 0 ? 'success' : 'error'
          }
          trend={
            testTrend !== null
              ? { value: testTrend, isPositive: testTrend >= 0 }
              : undefined
          }
          reportFile={currentSnapshot.reportFile}
          onOpenReport={openReport}
        />
        <MetricCard
          title="Performance"
          value={Math.round(
            currentSnapshot.metrics.performance.lighthouse.performance
          )}
          subtitle="Lighthouse Score"
          icon={Gauge}
          status={
            currentSnapshot.metrics.performance.lighthouse.performance >= 90
              ? 'success'
              : 'warning'
          }
          trend={
            performanceTrend !== null
              ? { value: performanceTrend, isPositive: performanceTrend >= 0 }
              : undefined
          }
          reportFile={currentSnapshot.reportFile}
          onOpenReport={openReport}
        />
        <MetricCard
          title="Cobertura"
          value={`${currentSnapshot.metrics.coverage.lines.toFixed(1)}%`}
          subtitle="Linhas cobertas"
          icon={FileCode}
          status={
            currentSnapshot.metrics.coverage.lines >= 80 ? 'success' : 'warning'
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
            currentSnapshot.metrics.performance.bundleSize <= 600
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
      </div>

      {/* Row 2: Health Anchor & Trends */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <HealthScoreCard
            score={currentSnapshot.healthScore}
            previousScore={previousScore}
            confidenceLevel={currentSnapshot.confidenceLevel}
            status={scoreStatus}
            className="h-full"
          />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <TrendChart
            data={historicalData}
            metrics={['healthScore', 'performance', 'coverage']}
            className="h-full min-h-[350px]"
          />
        </div>
      </div>

      {/* Row 3: Detail Composition */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Section (Deep Dive) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ScoreBreakdown {...categoryScores} className="h-full" />
            </div>
            <div className="lg:col-span-8">
              <LighthouseCard
                scores={currentSnapshot.metrics.performance.lighthouse}
                className="h-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-border bg-card p-6 h-full shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Gauge size={80} />
                </div>

                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  Core Web Vitals
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'LCP',
                      full: 'Largest Contentful Paint',
                      value:
                        currentSnapshot.metrics.performance.webVitals.lcp.toFixed(
                          0
                        ) + 'ms',
                      trend: lcpTrend,
                    },
                    {
                      label: 'CLS',
                      full: 'Cumulative Layout Shift',
                      value:
                        currentSnapshot.metrics.performance.webVitals.cls.toFixed(
                          3
                        ),
                      trend: clsTrend,
                    },
                    {
                      label: 'TBT',
                      full: 'Total Blocking Time',
                      value:
                        Math.round(
                          currentSnapshot.metrics.performance.webVitals.tbt
                        ) + 'ms',
                      trend: tbtTrend,
                    },
                  ].map(vital => (
                    <div
                      key={vital.label}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all"
                    >
                      <p className="text-xs font-bold text-card-foreground mb-1">
                        {vital.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-tighter mb-2 leading-none">
                        {vital.full}
                      </p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-mono font-black text-success tracking-tighter">
                          {vital.value}
                        </span>
                        {vital.trend !== null && (
                          <div
                            className={cn(
                              'text-[10px] font-bold flex items-center gap-0.5',
                              vital.trend > 0
                                ? vital.label === 'CLS' ||
                                  vital.label === 'LCP' ||
                                  vital.label === 'TBT'
                                  ? 'text-error'
                                  : 'text-success'
                                : 'text-success'
                            )}
                          >
                            {vital.trend > 0 ? (
                              <TrendingUp size={10} />
                            ) : (
                              <TrendingDown size={10} />
                            )}
                            {Math.abs(vital.trend).toFixed(
                              vital.label === 'CLS' ? 3 : 0
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <SystemStatus
                stability={currentSnapshot.metrics.stability}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Right Section (Timeline) */}
        <div className="col-span-12 lg:col-span-3">
          <CommitTimeline
            commits={recentCommits}
            className="h-full max-h-[850px] overflow-y-auto custom-scrollbar"
          />
        </div>
      </div>
    </div>
  )
}
