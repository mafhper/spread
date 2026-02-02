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
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden relative',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          Lighthouse Audits
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          REAL-TIME DATA
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ key, label }) => {
          const score = scores[key]
          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center p-4 rounded-xl border transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5',
                getScoreColor(score)
                  .replace('text-', 'border-')
                  .replace('border-', 'border-'), // Ensuring it's a border color
                getScoreBg(score),
                'border-opacity-20'
              )}
            >
              <div className="relative mb-2">
                <span
                  className={cn(
                    'text-3xl font-black font-mono tracking-tighter',
                    getScoreColor(score).split(' ')[0]
                  )}
                >
                  {score}
                </span>
              </div>
              <span className="text-[10px] font-bold text-center uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>

              {/* Progress visual indicator */}
              <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden opacity-40">
                <div
                  className={cn(
                    'h-full transition-all duration-1000',
                    getScoreColor(score).split(' ')[0].replace('text-', 'bg-')
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
