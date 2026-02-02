import {
  Bell,
  Search,
  RefreshCw,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Trash2,
  ExternalLink,
  AlertTriangle,
  FileText,
  Zap,
  FlaskConical as LucideFlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ThemeToggle'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { useQualityData } from '@/contexts/QualityDataContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useNavigate } from 'react-router-dom'

interface DashboardHeaderProps {
  projectName?: string
}

export function DashboardHeader({
  projectName = 'Spread',
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const {
    currentSnapshot,
    runAction,
    isActionRunning,
    setConsoleOpen,
    notificationHistory,
    clearNotifications,
    searchQuery,
    setSearchQuery,
    searchResults,
    openReport,
    openFile,
  } = useQualityData()

  const now = new Date()
  const formattedDate = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Determine overall status
  const overallStatus = !currentSnapshot
    ? 'warn'
    : currentSnapshot.healthScore >= 80
      ? 'pass'
      : currentSnapshot.healthScore >= 50
        ? 'warn'
        : 'fail'

  // Determine status message and problems
  const getStatusInfo = () => {
    if (!currentSnapshot) {
      return {
        message: 'Dados não carregados',
        problems: [],
        healthScore: 0,
      }
    }

    const health = currentSnapshot.healthScore
    const problems: string[] = []

    if (
      currentSnapshot.metrics.tests &&
      currentSnapshot.metrics.tests.failed > 0
    ) {
      problems.push(`${currentSnapshot.metrics.tests.failed} testes falhando`)
    }
    if (
      currentSnapshot.metrics.coverage &&
      currentSnapshot.metrics.coverage.percentage < 50
    ) {
      problems.push('Cobertura abaixo de 50%')
    }
    if (
      currentSnapshot.metrics.performance &&
      currentSnapshot.metrics.performance.warnings > 0
    ) {
      problems.push(
        `${currentSnapshot.metrics.performance.warnings} avisos de performance`
      )
    }

    let message = ''
    if (health >= 80) {
      message = 'Sistema saudável'
    } else if (health >= 50) {
      message = 'Atenção necessária'
    } else {
      message = 'Problemas críticos'
    }

    return { message, problems, healthScore: health }
  }

  const statusInfo = getStatusInfo()

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Project info */}
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl rotate-6 opacity-80 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-[2px] bg-zinc-950 rounded-xl flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="Logo Spread"
                className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 animate-color-shift"
                style={{ filter: 'brightness(1.5) contrast(1.1)' }}
                onError={e => {
                  // Fallback directly to github if /logo.svg fails or is wrong
                  ;(e.target as HTMLImageElement).src =
                    'https://raw.githubusercontent.com/mafhper/spread/main/public/logo.svg'
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
                Projeto
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2 leading-none mt-0.5">
              {projectName}
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <StatusBadge status={overallStatus} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {statusInfo.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Score:{' '}
                          <span className="font-mono font-bold">
                            {statusInfo.healthScore.toFixed(0)}/100
                          </span>
                        </p>
                      </div>
                      {statusInfo.problems.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Problemas:
                          </p>
                          <ul className="text-xs space-y-0.5">
                            {statusInfo.problems.map((problem, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                • {problem}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-blue-500 hover:text-blue-600"
                          onClick={() => {
                            // Navigation will be handled when we implement task routing
                            console.log('Navigate to metrics/report page')
                          }}
                        >
                          Ver detalhes completos →
                        </Button>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar testes, relatórios, commits..."
              className="pl-10 bg-muted/50 border-border"
              value={searchQuery}
              onChange={e => {
                console.log('[search-debug] Query changed to:', e.target.value)
                setSearchQuery(e.target.value)
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-20"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}

            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>

            {/* Global Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[320px]">
                <div className="p-2 border-b border-border bg-muted/30 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                    {searchResults.length > 0
                      ? 'Resultados da Busca'
                      : 'Nenhum resultado'}
                  </span>
                  {searchResults.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                      {searchResults.length}
                    </span>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => {
                          if (result.type === 'report' && result.payload) {
                            openReport(result.payload)
                          } else if (result.type === 'test') {
                            navigate('/tests')
                          } else if (result.type === 'file' && result.payload) {
                            openFile(result.payload)
                          }
                          setSearchQuery('')
                        }}
                        className="w-full text-left p-3 hover:bg-muted/50 flex items-center gap-3 transition-colors border-b border-border/50 last:border-0 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {result.type === 'test' ? (
                            <LucideFlaskConical className="h-4 w-4" />
                          ) : result.type === 'report' ? (
                            <FileText className="h-4 w-4" />
                          ) : result.type === 'file' ? (
                            <FileText className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {result.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Não encontramos nada para "{searchQuery}"
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Tente buscar por nomes de arquivos, hashes de commit ou
                        títulos de testes.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Actions Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex"
            onClick={() => runAction('run-tests', 'Executar Testes')}
            disabled={isActionRunning}
          >
            {isActionRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Rodar Testes
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => runAction('generate-report', 'Gerar Relatório')}
            disabled={isActionRunning}
            title="Gerar Novo Relatório de Qualidade"
          >
            <RefreshCw
              className={`h-4 w-4 ${isActionRunning ? 'animate-spin' : ''}`}
            />
          </Button>

          {/* System time */}
          <div className="hidden lg:flex flex-col items-end text-xs text-muted-foreground ml-2 mr-2">
            <span className="font-mono">{formattedTime}</span>
            <span>{formattedDate}</span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                {notificationHistory.length > 0 && (
                  <span
                    className={cn(
                      'absolute top-1.5 right-1.5 w-2 h-2 rounded-full',
                      isActionRunning ? 'bg-blue-500 animate-pulse' : 'bg-error'
                    )}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <h3 className="font-semibold text-sm">Notificações</h3>
                {notificationHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={clearNotifications}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <ScrollArea className="h-72">
                {notificationHistory.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Sem atividades recentes</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notificationHistory.map(n => (
                      <div
                        key={n.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => setConsoleOpen(true)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {n.status === 'running' ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : n.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-error" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none mb-1">
                              {n.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(n.timestamp).toLocaleTimeString()} •{' '}
                              {n.status === 'running'
                                ? 'Executando...'
                                : 'Finalizado'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notificationHistory.length > 0 && (
                <div className="p-2 border-t bg-muted/10 text-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto text-[10px]"
                    onClick={() => setConsoleOpen(true)}
                  >
                    Abrir Terminal Console
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
