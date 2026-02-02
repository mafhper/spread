import { cn } from '@/lib/utils'
import { FlaskConical, Gauge, FileCode, Server } from 'lucide-react'

interface ScoreCategory {
  score: number
  weight: number
}

interface ScoreBreakdownProps {
  tests: ScoreCategory
  performance: ScoreCategory
  coverage: ScoreCategory
  stability: ScoreCategory
  className?: string
}

const categories = [
  { key: 'tests', label: 'Testes', icon: FlaskConical },
  { key: 'performance', label: 'Performance', icon: Gauge },
  { key: 'coverage', label: 'Cobertura', icon: FileCode },
  { key: 'stability', label: 'Estabilidade', icon: Server },
] as const

function getScoreColor(score: number) {
  if (score >= 90) return 'bg-score-excellent'
  if (score >= 75) return 'bg-score-good'
  if (score >= 50) return 'bg-score-medium'
  if (score >= 25) return 'bg-score-poor'
  return 'bg-score-critical'
}

function getTextColor(score: number) {
  if (score >= 90) return 'text-score-excellent'
  if (score >= 75) return 'text-score-good'
  if (score >= 50) return 'text-score-medium'
  if (score >= 25) return 'text-score-poor'
  return 'text-score-critical'
}

export function ScoreBreakdown({
  tests,
  performance,
  coverage,
  stability,
  className,
}: ScoreBreakdownProps) {
  const data = { tests, performance, coverage, stability }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Breakdown do Score
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
          WEIGHTED TOTAL
        </span>
      </div>

      <div className="space-y-5">
        {categories.map(({ key, label, icon: Icon }) => {
          const category = data[key]
          return (
            <div key={key} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-card-foreground leading-none">
                      {label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">
                      Peso: {category.weight}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'text-sm font-black font-mono tracking-tighter',
                      getTextColor(category.score)
                    )}
                  >
                    {category.score}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    getScoreColor(category.score)
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Weighted calculation explanation */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 italic bg-muted/20 p-2 rounded-lg border border-border/30">
          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary not-italic">
            ?
          </div>
          Score final = Σ (categoria × peso) / 100
        </div>
      </div>
    </div>
  )
}
