import {
  Gauge,
  Eye,
  Shield,
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useQualityData } from '@/contexts/QualityDataContext'
import { cn } from '@/lib/utils'
import { TrendChart } from '@/components/dashboard/TrendChart'

function getScoreColor(score: number) {
  if (score >= 90) return 'text-score-excellent'
  if (score >= 50) return 'text-score-medium'
  return 'text-score-critical'
}

function getScoreBg(score: number) {
  if (score >= 90) return 'bg-score-excellent'
  if (score >= 50) return 'bg-score-medium'
  return 'bg-score-critical'
}

const lighthouseCategories = [
  { key: 'performance', label: 'Performance', icon: Gauge },
  { key: 'accessibility', label: 'Acessibilidade', icon: Eye },
  { key: 'bestPractices', label: 'Boas Práticas', icon: Shield },
  { key: 'seo', label: 'SEO', icon: SearchIcon },
] as const

export default function PerformancePage() {
  const { currentSnapshot, historicalData, isLoading, error } = useQualityData()

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando dados de performance...
        </p>
      </div>
    )
  }

  if (error || !currentSnapshot) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold">Erro ao carregar dados</h3>
        <p className="text-muted-foreground">
          {error || 'Snapshots de performance não encontrados.'}
        </p>
      </div>
    )
  }

  const { lighthouse, webVitals, bundleSize } =
    currentSnapshot.metrics.performance
  const prevSnapshot = historicalData[historicalData.length - 2]

  const calculateTrend = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null
    const diff = current - previous
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
    }
  }

  const lcpTrend = calculateTrend(webVitals.lcp, prevSnapshot?.lcp)
  const clsTrend = calculateTrend(webVitals.cls, prevSnapshot?.cls)
  const tbtTrend = calculateTrend(webVitals.tbt, prevSnapshot?.tbt)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Métricas Lighthouse e Core Web Vitals
        </p>
      </div>

      {/* Lighthouse Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {lighthouseCategories.map(({ key, label, icon: Icon }) => {
          const score = lighthouse[key]
          return (
            <div
              key={key}
              className={cn(
                'rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg',
                score >= 90
                  ? 'border-score-excellent/30'
                  : score >= 50
                    ? 'border-score-medium/30'
                    : 'border-score-critical/30'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center',
                  score >= 90
                    ? 'bg-score-excellent/10'
                    : score >= 50
                      ? 'bg-score-medium/10'
                      : 'bg-score-critical/10'
                )}
              >
                <Icon className={cn('h-6 w-6', getScoreColor(score))} />
              </div>
              <div
                className={cn(
                  'text-4xl font-bold font-mono mb-2',
                  getScoreColor(score)
                )}
              >
                {Math.round(score)}
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
              <div
                className={cn(
                  'w-full h-1.5 rounded-full mt-4 bg-muted overflow-hidden'
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    getScoreBg(score)
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Core Web Vitals */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-6">
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LCP */}
          <div className="text-center p-4 rounded-lg bg-muted/30 relative">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Largest Contentful Paint
            </div>
            <div
              className={cn(
                'text-3xl font-bold font-mono',
                webVitals.lcp <= 2500
                  ? 'text-success'
                  : webVitals.lcp <= 4000
                    ? 'text-warning'
                    : 'text-error'
              )}
            >
              {(webVitals.lcp / 1000).toFixed(2)}s
            </div>
            {lcpTrend && (
              <div
                className={cn(
                  'text-[10px] mt-1 flex items-center justify-center gap-0.5',
                  lcpTrend.isPositive ? 'text-error' : 'text-success'
                )}
              >
                {lcpTrend.isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {Math.abs(lcpTrend.value / 1000).toFixed(2)}s vs anterior
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Meta: ≤ 2.5s
            </div>
          </div>

          {/* CLS */}
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Cumulative Layout Shift
            </div>
            <div
              className={cn(
                'text-3xl font-bold font-mono',
                webVitals.cls <= 0.1
                  ? 'text-success'
                  : webVitals.cls <= 0.25
                    ? 'text-warning'
                    : 'text-error'
              )}
            >
              {webVitals.cls.toFixed(3)}
            </div>
            {clsTrend && (
              <div
                className={cn(
                  'text-[10px] mt-1 flex items-center justify-center gap-0.5',
                  clsTrend.isPositive ? 'text-error' : 'text-success'
                )}
              >
                {clsTrend.isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {clsTrend.value.toFixed(3)} vs anterior
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Meta: ≤ 0.1
            </div>
          </div>

          {/* TBT */}
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Total Blocking Time
            </div>
            <div
              className={cn(
                'text-3xl font-bold font-mono',
                webVitals.tbt <= 200
                  ? 'text-success'
                  : webVitals.tbt <= 600
                    ? 'text-warning'
                    : 'text-error'
              )}
            >
              {Math.round(webVitals.tbt)}ms
            </div>
            {tbtTrend && (
              <div
                className={cn(
                  'text-[10px] mt-1 flex items-center justify-center gap-0.5',
                  tbtTrend.isPositive ? 'text-error' : 'text-success'
                )}
              >
                {tbtTrend.isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {Math.abs(tbtTrend.value)}ms vs anterior
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Meta: ≤ 200ms
            </div>
          </div>
        </div>
      </div>

      <TrendChart
        data={historicalData}
        metrics={['performance', 'lcp', 'tbt', 'bundleSize']}
        className="mt-6"
      />

      {/* Bundle Size */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tamanho do Bundle
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold font-mono text-card-foreground">
                {bundleSize.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">KB</span>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              bundleSize <= 350
                ? 'bg-success/10 text-success'
                : 'bg-warning/10 text-warning'
            )}
          >
            {bundleSize > 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{bundleSize > 0 ? 'Monitorado' : 'Sem dados'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
