import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HealthScoreCardProps {
  score: number
  previousScore?: number
  confidenceLevel: 'high' | 'medium' | 'low'
  status: string
  className?: string
}

export function HealthScoreCard({
  score,
  previousScore = 0,
  confidenceLevel,
  status,
  className,
}: HealthScoreCardProps) {
  console.log('[ui-debug] HealthScoreCard:', { score, confidenceLevel, status })
  const delta = score - previousScore

  const scoreColorClass = useMemo(() => {
    if (score >= 90) return 'text-score-excellent'
    if (score >= 75) return 'text-score-good'
    if (score >= 50) return 'text-score-medium'
    if (score >= 25) return 'text-score-poor'
    return 'text-score-critical'
  }, [score])

  const ringColorClass = useMemo(() => {
    if (score >= 90) return 'stroke-score-excellent'
    if (score >= 75) return 'stroke-score-good'
    if (score >= 50) return 'stroke-score-medium'
    if (score >= 25) return 'stroke-score-poor'
    return 'stroke-score-critical'
  }, [score])

  const glowClass = useMemo(() => {
    if (score >= 75) return 'glow-success'
    if (score >= 50) return 'glow-warning'
    return 'glow-error'
  }, [score])

  const confidenceBadge = {
    high: {
      label: 'Alta Confiança',
      color: 'bg-success/15 text-success border-success/30',
    },
    medium: {
      label: 'Média Confiança',
      color: 'bg-warning/15 text-warning border-warning/30',
    },
    low: {
      label: 'Baixa Confiança',
      color: 'bg-error/15 text-error border-error/30',
    },
  }

  // SVG circle properties
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div
      className={cn(
        'relative rounded-2xl border border-border bg-card p-8 transition-all duration-500 overflow-hidden',
        glowClass,
        className
      )}
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
        <TrendingUp size={120} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Health Score
          </h3>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-3">
              <p className="text-xs leading-relaxed">
                Indicador global de saúde do projeto calculado a partir de:
                <span className="block mt-1 font-mono text-[10px]">
                  • Testes (40%) • Performance (30%)
                  <br />• Cobertura (20%) • Estabilidade (10%)
                </span>
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span
          className={cn(
            'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm transition-colors',
            confidenceBadge[confidenceLevel].color
          )}
        >
          {confidenceBadge[confidenceLevel].label}
        </span>
      </div>

      {/* Score Circle */}
      <div className="flex items-center justify-center py-6 relative z-10">
        <div className="relative group">
          {/* Outer Ring Glow */}
          <div
            className={cn(
              'absolute inset-[-10px] rounded-full blur-2xl opacity-20 transition-opacity duration-1000 group-hover:opacity-40',
              score >= 75
                ? 'bg-success'
                : score >= 50
                  ? 'bg-warning'
                  : 'bg-error'
            )}
          />

          <svg
            className="w-40 h-40 -rotate-90 relative z-10"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="6"
              className="stroke-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn(
                'score-ring transition-all duration-1000 ease-in-out',
                ringColorClass
              )}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span
              className={cn(
                'text-5xl font-black font-mono tracking-tighter mb-1',
                scoreColorClass
              )}
            >
              {score}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] opacity-60">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Delta indicator */}
      <div className="flex items-center justify-center gap-3 mt-4 px-4 py-2 rounded-xl bg-muted/30 border border-border/50 relative z-10">
        {delta > 0 ? (
          <>
            <div className="p-1 rounded-full bg-success/20 text-success">
              <TrendingUp className="h-3 w-3" />
            </div>
            <span className="text-xs font-bold text-success">+{delta} pts</span>
          </>
        ) : delta < 0 ? (
          <>
            <div className="p-1 rounded-full bg-error/20 text-error">
              <TrendingDown className="h-3 w-3" />
            </div>
            <span className="text-xs font-bold text-error">{delta} pts</span>
          </>
        ) : (
          <>
            <Minus className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-xs font-bold text-muted-foreground/60">
              Estável
            </span>
          </>
        )}
        <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
          vs commit anterior
        </span>
      </div>
    </div>
  )
}
