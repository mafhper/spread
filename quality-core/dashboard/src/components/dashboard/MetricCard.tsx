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

  return (
    <div
      className={cn(
        'rounded-lg border border-border transition-all hover:shadow-md group relative',
        currentStyle.border,
        currentStyle.bg,
        currentStyle.hover,
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p
              className={cn(
                'text-2xl font-bold font-mono mt-1',
                currentStyle.textColor
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-error'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs anterior
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-2 rounded-lg', iconBgStyles[status])}>
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
