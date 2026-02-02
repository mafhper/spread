import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReportShortcut } from './ReportShortcut'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  status?: 'success' | 'warning' | 'error' | 'info'
  className?: string
  reportFile?: string
  onOpenReport?: (file: string) => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'info',
  className,
  reportFile,
  onOpenReport,
}: MetricCardProps) {
  if (title === 'Bundle Size') {
    console.log('[ui-debug] MetricCard Bundle Size:', value)
  }
  const statusStyles = {
    success: {
      border: 'border-l-success',
      bg: 'bg-success/5',
      hover: 'hover:bg-success/10 hover:shadow-success/20',
      textColor: 'text-success',
    },
    warning: {
      border: 'border-l-warning',
      bg: 'bg-warning/5',
      hover: 'hover:bg-warning/10 hover:shadow-warning/20',
      textColor: 'text-warning',
    },
    error: {
      border: 'border-l-error',
      bg: 'bg-error/5',
      hover: 'hover:bg-error/10 hover:shadow-error/20',
      textColor: 'text-error',
    },
    info: {
      border: 'border-l-info',
      bg: 'bg-info/5',
      hover: 'hover:bg-info/10 hover:shadow-info/20',
      textColor: 'text-info',
    },
  }

  const iconBgStyles = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  }

  const currentStyle = statusStyles[status]

  const isZero =
    value === 0 ||
    value === '0' ||
    value === '0.0%' ||
    value === '0%' ||
    value === 'N/A' ||
    !value

  return (
    <div
      className={cn(
        'rounded-xl border border-border transition-all duration-300 group relative overflow-hidden',
        currentStyle.bg,
        'hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1.5',
          currentStyle.textColor.replace('text-', 'bg-')
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              {isZero ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border mt-2 uppercase tracking-tighter">
                  Dados Indisponíveis
                </span>
              ) : (
                <p
                  className={cn(
                    'text-3xl font-black font-mono tracking-tighter',
                    currentStyle.textColor
                  )}
                >
                  {value}
                </p>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5 opacity-80">
                {subtitle}
              </p>
            )}
            {!isZero && trend && (
              <div className="flex items-center gap-1.5 mt-3 bg-background/50 w-fit px-2 py-0.5 rounded-full border border-border/50">
                <span
                  className={cn(
                    'text-[10px] font-bold flex items-center gap-0.5',
                    trend.isPositive ? 'text-success' : 'text-error'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'}
                  {Math.abs(trend.value)}
                  {typeof trend.value === 'number' && title !== 'Bundle Size'
                    ? '%'
                    : ''}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-tighter">
                  vs anterior
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-2.5 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300',
              iconBgStyles[status]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      {reportFile && onOpenReport && (
        <ReportShortcut reportFile={reportFile} onOpenReport={onOpenReport} />
      )}
    </div>
  )
}
