import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

interface TrendData {
  date: string
  healthScore: number
  coverage: number
  performance: number
  lcp?: number
  cls?: number
  tbt?: number
  bundleSize?: number
}

interface TrendChartProps {
  data: TrendData[]
  metrics?: Array<
    | 'healthScore'
    | 'coverage'
    | 'performance'
    | 'lcp'
    | 'cls'
    | 'tbt'
    | 'bundleSize'
  >
  className?: string
}

const metricConfigs = {
  healthScore: {
    color: 'hsl(160 84% 45%)',
    name: 'Health Score',
    gradient: 'healthGradient',
  },
  performance: {
    color: 'hsl(199 89% 55%)',
    name: 'Performance',
    gradient: 'perfGradient',
  },
  coverage: {
    color: 'hsl(38 92% 55%)',
    name: 'Cobertura',
    gradient: 'coverageGradient',
  },
  lcp: { color: 'hsl(280 84% 65%)', name: 'LCP', gradient: 'lcpGradient' },
  cls: { color: 'hsl(340 84% 65%)', name: 'CLS', gradient: 'clsGradient' },
  tbt: { color: 'hsl(20 84% 65%)', name: 'TBT', gradient: 'tbtGradient' },
  bundleSize: {
    color: 'hsl(200 10% 65%)',
    name: 'Bundle Size',
    gradient: 'bundleGradient',
  },
}

export function TrendChart({
  data,
  metrics = ['healthScore', 'performance', 'coverage'],
  className,
}: TrendChartProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-5', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Tendência de Métricas
        </h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {metrics.map(m => (
                <linearGradient
                  key={m}
                  id={metricConfigs[m].gradient}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={metricConfigs[m].color}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={metricConfigs[m].color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
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
              tickFormatter={value => {
                const date = new Date(value)
                return date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }}
            />
            <YAxis
              stroke="hsl(215 16% 47%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 9%)',
                border: '1px solid hsl(222 30% 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(210 20% 95%)' }}
              labelFormatter={value => new Date(value).toLocaleString('pt-BR')}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            {metrics.map(m => (
              <Area
                key={m}
                type="monotone"
                dataKey={m}
                stroke={metricConfigs[m].color}
                fill={`url(#${metricConfigs[m].gradient})`}
                strokeWidth={2}
                name={metricConfigs[m].name}
                dot={data.length < 20}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
