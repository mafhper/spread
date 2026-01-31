import { cn } from '@/lib/utils'

interface LighthouseScore {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

interface LighthouseCardProps {
  scores: LighthouseScore
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-score-excellent border-score-excellent'
  if (score >= 50) return 'text-score-medium border-score-medium'
  return 'text-score-critical border-score-critical'
}

function getScoreBg(score: number) {
  if (score >= 90) return 'bg-score-excellent/10'
  if (score >= 50) return 'bg-score-medium/10'
  return 'bg-score-critical/10'
}

const metrics = [
  { key: 'performance', label: 'Performance' },
  { key: 'accessibility', label: 'Acessibilidade' },
  { key: 'bestPractices', label: 'Boas Práticas' },
  { key: 'seo', label: 'SEO' },
] as const

export function LighthouseCard({ scores, className }: LighthouseCardProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-5', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Lighthouse
        </h3>
        <span className="text-xs text-muted-foreground">
          Última execução: agora
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {metrics.map(({ key, label }) => {
          const score = scores[key]
          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2',
                getScoreColor(score),
                getScoreBg(score)
              )}
            >
              <span className="text-2xl font-bold font-mono">{score}</span>
              <span className="text-xs text-center mt-1 text-muted-foreground">
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
