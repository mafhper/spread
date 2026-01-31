import {
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useQualityData } from '@/contexts/QualityDataContext'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

function getCoverageColor(value: number) {
  if (value >= 80) return 'text-success'
  if (value >= 60) return 'text-warning'
  return 'text-error'
}

function getCoverageBg(value: number) {
  if (value >= 80) return 'bg-success'
  if (value >= 60) return 'bg-warning'
  return 'bg-error'
}

const coverageMetrics = [
  { key: 'lines', label: 'Linhas' },
  { key: 'statements', label: 'Statements' },
  { key: 'branches', label: 'Branches' },
  { key: 'functions', label: 'Funções' },
] as const

export default function CoveragePage() {
  const { currentSnapshot, historicalData, isLoading, error } = useQualityData()
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando dados de cobertura...
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
          {error || 'Snapshots de cobertura não encontrados.'}
        </p>
      </div>
    )
  }

  const { coverage } = currentSnapshot.metrics
  const avgCoverage = Math.round(
    (coverage.lines +
      coverage.statements +
      coverage.branches +
      coverage.functions) /
      4
  )

  // Mock file coverage data
  const fileCoverage = [
    {
      file: 'quality-core/health-score.ts',
      coverage: 85.4,
      lines: 145,
      type: 'logic',
    },
    {
      file: 'quality-core/regression.ts',
      coverage: 92.1,
      lines: 78,
      type: 'logic',
    },
    {
      file: 'quality-core/snapshots.store.ts',
      coverage: 64.5,
      lines: 391,
      type: 'storage',
    },
    {
      file: 'quality-core/dashboard-server.ts',
      coverage: 42.0,
      lines: 225,
      type: 'server',
    },
    {
      file: 'src/components/ui/button.tsx',
      coverage: 100,
      lines: 45,
      type: 'ui',
    },
    {
      file: 'src/hooks/useSearch.ts',
      coverage: 78.2,
      lines: 112,
      type: 'hook',
    },
    {
      file: 'src/utils/formatters.ts',
      coverage: 88.9,
      lines: 56,
      type: 'util',
    },
  ].filter(f => f.file.toLowerCase().includes(search.toLowerCase()))

  const criticalFiles = [...fileCoverage]
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, 3)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Cobertura de Código
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Análise detalhada da cobertura de testes por módulo
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
            coverage.trend === 'up'
              ? 'bg-success/10 text-success'
              : coverage.trend === 'down'
                ? 'bg-error/10 text-error'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {coverage.trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>
            Tendência:{' '}
            {coverage.trend === 'up'
              ? 'Subindo'
              : coverage.trend === 'down'
                ? 'Descendo'
                : 'Estável'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Score */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-6">
              Cobertura Média Global
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span
                className={cn(
                  'text-6xl font-bold font-mono',
                  getCoverageColor(avgCoverage)
                )}
              >
                {avgCoverage}
              </span>
              <span className="text-2xl text-muted-foreground font-medium">
                %
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  getCoverageBg(avgCoverage)
                )}
                style={{ width: `${avgCoverage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Meta do projeto:{' '}
              <span className="text-foreground font-medium">80%</span>
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 gap-4">
            {coverageMetrics.map(({ key, label }) => {
              const value = coverage[key]
              return (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {label}
                    </span>
                    <FileCode className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <div
                    className={cn(
                      'text-3xl font-bold font-mono mb-3',
                      getCoverageColor(value)
                    )}
                  >
                    {value.toFixed(1)}%
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        getCoverageBg(value)
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Critical Files Warning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {criticalFiles.map(file => (
          <div
            key={file.file}
            className="p-4 rounded-xl border border-error/20 bg-error/5 flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-error truncate max-w-[200px]">
                {file.file.split('/').pop()}
              </h4>
              <p className="text-xs text-error/70 mt-1">
                Cobertura crítica: {file.coverage}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Histórico de Cobertura
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="coverageGradientPage"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(38 92% 50%)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(38 92% 50%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(222 30% 18%)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(215 16% 47%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={value =>
                  new Date(value).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                }
              />
              <YAxis
                stroke="hsl(215 16% 47%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(222 30% 18%)',
                  borderRadius: '8px',
                }}
                labelFormatter={value =>
                  new Date(value).toLocaleString('pt-BR')
                }
              />
              <Area
                type="monotone"
                dataKey="coverage"
                stroke="hsl(38 92% 55%)"
                fill="url(#coverageGradientPage)"
                strokeWidth={2}
                name="Cobertura %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Files Coverage Table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Detalhamento por Arquivo
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar arquivos..."
              className="pl-10 h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          {fileCoverage.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic">
              Nenhum arquivo encontrado para "{search}"
            </div>
          ) : (
            fileCoverage
              .sort((a, b) => a.coverage - b.coverage)
              .map(file => (
                <div
                  key={file.file}
                  className="flex items-center gap-4 p-3 rounded-lg border border-transparent bg-muted/20 hover:border-border transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate font-mono">
                      {file.file}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1.5 py-0.5 bg-muted rounded">
                        {file.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.lines} linhas totais
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000',
                          getCoverageBg(file.coverage)
                        )}
                        style={{ width: `${file.coverage}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-mono font-bold w-12 text-right',
                        getCoverageColor(file.coverage)
                      )}
                    >
                      {file.coverage.toFixed(0)}%
                    </span>
                    {file.coverage < 70 ? (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
