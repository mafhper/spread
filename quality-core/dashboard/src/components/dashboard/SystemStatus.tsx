import { Wifi, WifiOff, Clock, Activity, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StabilityMetrics } from '@/lib/mock-data'
import { useQualityData } from '@/contexts/QualityDataContext'
import { useSettings } from '@/contexts/SettingsContext'
import { Link } from 'react-router-dom'

interface SystemStatusProps {
  stability: StabilityMetrics
  className?: string
}

export function SystemStatus({ stability, className }: SystemStatusProps) {
  const { realLatency } = useQualityData()
  const { githubUrl } = useSettings()

  const statusColor = {
    online: 'text-success',
    degraded: 'text-warning',
    offline: 'text-error',
  }

  const statusBg = {
    online: 'bg-success',
    degraded: 'bg-warning',
    offline: 'bg-error',
  }

  const statusLabel = {
    online: 'Online',
    degraded: 'Degradado',
    offline: 'Offline',
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm group relative overflow-hidden flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-live" />
          Live Status
        </h3>
        <Link
          to="/settings"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-muted bg-muted/20 border border-border/50"
          title="Configurações"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
      </div>

      <div className="space-y-5 flex-1 relative z-10">
        {/* Site Badge */}
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50 flex flex-col gap-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Target Endpoint
          </span>
          <p className="text-xs font-mono font-bold text-foreground truncate">
            {githubUrl || 'Não configurado'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Connection & Latency */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'p-1.5 rounded-lg bg-background/50',
                  statusColor[stability.status]
                )}
              >
                {stability.status === 'offline' ? (
                  <WifiOff size={14} />
                ) : (
                  <Wifi size={14} />
                )}
              </div>
              <span className="text-xs font-bold text-card-foreground">
                Latency
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-black tracking-tighter">
                {realLatency > 0 ? `${realLatency}ms` : '---'}
              </p>
            </div>
          </div>

          {/* Uptime Visual */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-background/50 text-primary">
                  <Activity size={14} />
                </div>
                <span className="text-xs font-bold text-card-foreground">
                  Uptime
                </span>
              </div>
              <span
                className={cn(
                  'text-xs font-mono font-black',
                  stability.uptime >= 99
                    ? 'text-success'
                    : stability.uptime >= 95
                      ? 'text-warning'
                      : 'text-error'
                )}
              >
                {stability.uptime}%
              </span>
            </div>
            <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-1000',
                  stability.uptime >= 99
                    ? 'bg-success'
                    : stability.uptime >= 95
                      ? 'bg-warning'
                      : 'bg-error'
                )}
                style={{ width: `${stability.uptime}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between opacity-60">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
          Verified
        </span>
        <span className="text-[10px] font-mono text-foreground font-bold">
          {new Date(stability.lastCheck).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
