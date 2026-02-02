/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import {
  QualitySnapshot as MockSnapshot,
  currentSnapshot as defaultMockSnapshot,
} from '../lib/mock-data'
import { toast } from 'sonner'

// Real schema types matching the backend QualitySnapshot
interface RealSnapshot {
  version: string
  commitHash: string
  timestamp: string
  branch: string
  healthScore: number
  confidenceLevel: 'high' | 'medium' | 'low'
  reportFile?: string
  metrics: {
    tests: {
      total: number
      passed: number
      failed: number
      skipped: number
      duration: number // ms
      suites: {
        name: string
        tests: number
        passed: number
        failed: number
        duration: number
        status: 'passed' | 'failed' | 'flaky'
      }[]
    }
    coverage: {
      lines: number
      statements: number
      branches: number
      functions: number
      trend: 'up' | 'down' | 'stable'
    }
    performance: {
      lighthouse: {
        performance: number
        accessibility: number
        bestPractices: number
        seo: number
      }
      webVitals: {
        lcp: number
        cls: number
        tbt: number
      }
      bundleSize: number
    }
    stability: {
      uptime: number
      latency: number
      lastCheck: string
      status: 'online' | 'degraded' | 'offline'
    }
  }
}

interface HistoricalDataItem {
  date: string
  healthScore: number
  coverage: number
  performance: number
  tests: { passed: number; failed: number }
  lcp: number
  cls: number
  tbt: number
  bundleSize: number
}

interface CommitItem {
  hash: string
  message: string
  author: string
  date: string
  healthScore: number
  delta: number
  reportFile?: string
}

interface QualityDataContextType {
  currentSnapshot: MockSnapshot | null
  historicalData: HistoricalDataItem[]
  recentCommits: CommitItem[]
  failedTests: unknown[]
  isLoading: boolean
  error: string | null
  realLatency: number
  refreshData: () => Promise<void>
  runAction: (
    action:
      | 'run-tests'
      | 'generate-report'
      | 'quality-core'
      | 'quality-lighthouse',
    label: string
  ) => Promise<void>
  isActionRunning: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  consoleState: {
    isOpen: boolean
    title: string
    output: string
    isFinished: boolean
    isSuccess: boolean
  }
  setConsoleOpen: (open: boolean) => void
  reportModalState: {
    isOpen: boolean
    reportFile: string | undefined
  }
  fileViewerState: {
    isOpen: boolean
    filePath: string
    content: string
  }
  openReport: (file: string) => void
  setReportModalOpen: (open: boolean) => void
  setFileViewerOpen: (open: boolean) => void
  quickActionsOpen: boolean
  setQuickActionsOpen: (open: boolean) => void
  notificationHistory: {
    id: string
    title: string
    timestamp: Date
    status: 'running' | 'success' | 'error'
  }[]
  clearNotifications: () => void
  searchResults: {
    type: 'test' | 'report' | 'commit' | 'file'
    title: string
    subtitle: string
    id: string
    payload?: any
  }[]
  openFile: (path: string) => Promise<void>
}

const QualityDataContext = createContext<QualityDataContextType | undefined>(
  undefined
)

export const useQualityData = () => {
  const context = useContext(QualityDataContext)
  if (!context) {
    throw new Error('useQualityData must be used within a QualityDataProvider')
  }
  return context
}

export const QualityDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSnapshot, setCurrentSnapshot] = useState<MockSnapshot | null>(
    null
  )
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([])
  const [recentCommits, setRecentCommits] = useState<CommitItem[]>([])
  const [failedTests, setFailedTests] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realLatency, setRealLatency] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')

  const [isActionRunning, setIsActionRunning] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState<
    QualityDataContextType['notificationHistory']
  >([])
  const [consoleState, setConsoleState] = useState<
    QualityDataContextType['consoleState']
  >({
    isOpen: false,
    title: '',
    output: '',
    isFinished: false,
    isSuccess: false,
  })

  const [reportModalState, setReportModalState] = useState<
    QualityDataContextType['reportModalState']
  >({
    isOpen: false,
    reportFile: undefined,
  })

  const [fileViewerState, setFileViewerState] = useState<
    QualityDataContextType['fileViewerState']
  >({
    isOpen: false,
    filePath: '',
    content: '',
  })

  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [fileSearchResults, setFileSearchResults] = useState<
    QualityDataContextType['searchResults']
  >([])

  const setConsoleOpen = (open: boolean) =>
    setConsoleState(prev => ({ ...prev, isOpen: open }))

  const setFileViewerOpen = (open: boolean) =>
    setFileViewerState(prev => ({ ...prev, isOpen: open }))

  const setReportModalOpen = (open: boolean) => {
    setReportModalState(prev => ({ ...prev, isOpen: open }))
  }

  const openReport = (file: string) => {
    console.log(`[report-debug] Opening global report: ${file}`)
    setReportModalState({
      isOpen: true,
      reportFile: file,
    })
  }

  const openFile = async (filePath: string) => {
    try {
      setFileViewerState({
        isOpen: true,
        filePath,
        content: 'Carregando...',
      })

      const res = await fetch(
        `/api/files/content?path=${encodeURIComponent(filePath)}`
      )
      if (!res.ok) throw new Error('Failed to fetch file content')
      const content = await res.text()

      setFileViewerState({
        isOpen: true,
        filePath,
        content,
      })
    } catch (err) {
      toast.error('Erro ao abrir arquivo')
      setFileViewerState(prev => ({ ...prev, isOpen: false }))
      console.error(err)
    }
  }

  const clearNotifications = () => setNotificationHistory([])

  const runAction = async (
    action:
      | 'run-tests'
      | 'generate-report'
      | 'quality-core'
      | 'quality-lighthouse',
    label: string
  ) => {
    if (isActionRunning) return

    console.log(`[action-debug] Starting action: ${action} (${label})`)
    const id = Math.random().toString(36).substring(7)
    const newNotification = {
      id,
      title: label,
      timestamp: new Date(),
      status: 'running' as const,
    }
    setNotificationHistory(prev => [newNotification, ...prev].slice(0, 10))

    // Mapeamento de ações para comandos do package.json
    const commandMap: Record<string, string> = {
      'run-tests': 'test',
      'generate-report': 'quality:core',
      'quality-core': 'quality:core',
      'quality-lighthouse': 'quality:lighthouse',
    }

    setIsActionRunning(true)
    setConsoleState({
      isOpen: true,
      title: label,
      output: `> bun run ${commandMap[action] || action}\n`,
      isFinished: false,
      isSuccess: false,
    })

    try {
      console.log(`[action-debug] Fetching /api/action for ${action}`)
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log(
        `[action-debug] Action ${action} response received:`,
        data.success ? 'Success' : 'Failed'
      )

      setConsoleState(prev => ({
        ...prev,
        output:
          prev.output + (data.output || data.error || 'Sem output retornado.'),
        isFinished: true,
        isSuccess: data.success,
      }))

      setNotificationHistory(prev =>
        prev.map(n =>
          n.id === id ? { ...n, status: data.success ? 'success' : 'error' } : n
        )
      )

      if (data.success) {
        toast.success(`${label} concluído com sucesso!`)
        await fetchData()
      } else {
        toast.error(`${label} falhou. Verifique os logs no console.`)
      }
    } catch (err) {
      console.error(`[action-debug] Action ${action} fatal error:`, err)
      setConsoleState(prev => ({
        ...prev,
        output:
          prev.output +
          `\nErro fatal de conexão: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        isFinished: true,
        isSuccess: false,
      }))
      setNotificationHistory(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'error' } : n))
      )
      toast.error(
        `Erro de comunicação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
      )
    } finally {
      setIsActionRunning(false)
    }
  }

  const mapRealToMock = (real: RealSnapshot): MockSnapshot => {
    console.log(
      '[mapping-debug] Transformando snapshot:',
      real.commitHash || 'sem hash'
    )
    try {
      // Ensure tests metrics are properly mapped
      const metrics = {
        ...real.metrics,
        tests: {
          ...real.metrics.tests,
          total: real.metrics.tests.total || 0,
          passed: real.metrics.tests.passed || 0,
          failed: real.metrics.tests.failed || 0,
          skipped: real.metrics.tests.skipped || 0,
          duration: real.metrics.tests.duration || 0,
          suites:
            real.metrics.tests.suites && real.metrics.tests.suites.length > 0
              ? real.metrics.tests.suites
              : [
                  {
                    name: 'All Tests',
                    tests: real.metrics.tests.total,
                    passed: real.metrics.tests.passed,
                    failed: real.metrics.tests.failed,
                    duration: real.metrics.tests.duration,
                    status:
                      real.metrics.tests.failed === 0 ? 'passed' : 'failed',
                  },
                ],
        },
      }

      return {
        commitHash: real.commitHash,
        timestamp: real.timestamp,
        branch: real.branch,
        healthScore: real.healthScore,
        confidenceLevel: real.confidenceLevel,
        reportFile: real.reportFile,
        metrics,
      }
    } catch (err) {
      console.error('[mapping-debug] Erro ao mapear snapshot:', err)
      throw err
    }
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    console.log('[api-debug] Iniciando carregamento de dados...')
    try {
      // Fetch Real-time Latency
      fetch('/api/latency')
        .then(res => res.json())
        .then(d => {
          if (d.success) {
            console.log('[latency-debug] Latência recebida:', d.latency, 'ms')
            setRealLatency(d.latency)
          }
        })
        .catch(err =>
          console.error('[latency-debug] Erro ao medir latência:', err)
        )

      const response = await fetch('/api/snapshots')
      if (!response.ok) throw new Error('Failed to fetch snapshots')

      const json = await response.json()
      console.log(
        '[api-debug] Snapshots recebidos:',
        json.data?.length || 0,
        'itens'
      )

      if (!json.success) throw new Error(json.error || 'Unknown error')

      const snapshots: RealSnapshot[] = json.data

      if (snapshots && snapshots.length > 0) {
        const latest = snapshots[0]
        console.log(
          '[api-debug] Processando snapshot mais recente:',
          latest.commitHash
        )
        setCurrentSnapshot(mapRealToMock(latest))

        // Map history
        const history: HistoricalDataItem[] = snapshots
          .map(s => {
            return {
              date: s.timestamp,
              healthScore: s.healthScore,
              coverage: s.metrics?.coverage?.lines || 0,
              performance: s.metrics?.performance?.lighthouse?.performance || 0,
              tests: {
                passed: s.metrics?.tests?.passed || 0,
                failed: s.metrics?.tests?.failed || 0,
              },
              lcp: s.metrics?.performance?.webVitals?.lcp || 0,
              cls: s.metrics?.performance?.webVitals?.cls || 0,
              tbt: s.metrics?.performance?.webVitals?.tbt || 0,
              bundleSize: s.metrics?.performance?.bundleSize || 0,
            }
          })
          .reverse()
        setHistoricalData(history)

        // Map recent commits
        const commits: CommitItem[] = snapshots
          .slice(0, 10)
          .map((s, i, arr) => {
            const prevScore = arr[i + 1]?.healthScore || s.healthScore
            return {
              hash: s.commitHash,
              message: 'Quality Snapshot',
              author: 'system',
              date: new Date(s.timestamp).toLocaleString(),
              healthScore: s.healthScore,
              delta: s.healthScore - prevScore,
              reportFile: s.reportFile,
            }
          })
        setRecentCommits(commits)
        console.log('[api-debug] Histórico e commits mapeados com sucesso')

        setFailedTests([])
      } else {
        console.warn(
          '[api-debug] Nenhum snapshot retornado pela API. Usando dados mock como fallback.'
        )
        console.log('[api-debug] Default mock snapshot:', {
          commit: defaultMockSnapshot.commitHash,
          testTotal: defaultMockSnapshot.metrics.tests.total,
          testPassed: defaultMockSnapshot.metrics.tests.passed,
          testFailed: defaultMockSnapshot.metrics.tests.failed,
          healthScore: defaultMockSnapshot.healthScore,
        })
        // Use mock data as fallback
        setCurrentSnapshot(defaultMockSnapshot)

        // Create mock historical data
        const mockHistory: HistoricalDataItem[] = [
          {
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            healthScore: 82,
            coverage: 76,
            performance: 89,
            tests: { passed: 135, failed: 4 },
            lcp: 2100,
            cls: 0.08,
            tbt: 145,
            bundleSize: 285,
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            healthScore: 84,
            coverage: 77.2,
            performance: 91,
            tests: { passed: 136, failed: 3 },
            lcp: 2000,
            cls: 0.075,
            tbt: 140,
            bundleSize: 290,
          },
          {
            date: new Date().toISOString(),
            healthScore: 87,
            coverage: 78.5,
            performance: 94,
            tests: { passed: 138, failed: 2 },
            lcp: 1800,
            cls: 0.065,
            tbt: 125,
            bundleSize: 295,
          },
        ]
        setHistoricalData(mockHistory)

        // Create mock commit history
        const mockCommits: CommitItem[] = [
          {
            hash: 'a3f8d2e',
            message: 'Latest quality snapshot',
            author: 'system',
            date: new Date().toLocaleString(),
            healthScore: 87,
            delta: 3,
            reportFile: undefined,
          },
          {
            hash: 'b2e7c1f',
            message: 'Previous quality snapshot',
            author: 'system',
            date: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toLocaleString(),
            healthScore: 84,
            delta: 2,
            reportFile: undefined,
          },
          {
            hash: 'c1d6b0g',
            message: 'Earlier quality snapshot',
            author: 'system',
            date: new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000
            ).toLocaleString(),
            healthScore: 82,
            delta: 0,
            reportFile: undefined,
          },
        ]
        setRecentCommits(mockCommits)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[api-debug] Erro fatal no carregamento:', message)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Global Search Logic
  const query = searchQuery.toLowerCase().trim()
  useEffect(() => {
    if (!query || query.length < 2) {
      setFileSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/files/search?q=${encodeURIComponent(query)}`
        )
        const json = await res.json()
        if (json.success) {
          const results = json.data.map((f: string) => ({
            type: 'file',
            title: f.split('/').pop() || f,
            subtitle: f,
            id: `file-${f}`,
            payload: f,
          }))
          setFileSearchResults(results)
        }
      } catch (err) {
        console.error('File search error:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const searchResults = React.useMemo(() => {
    if (!query) return []

    console.log('[search-context] Running search for:', query)
    const results: QualityDataContextType['searchResults'] = []

    // 1. Search in Test Suites
    if (currentSnapshot) {
      currentSnapshot.metrics.tests.suites.forEach(s => {
        if (s.name.toLowerCase().includes(query)) {
          results.push({
            type: 'test',
            title: s.name,
            subtitle: `${s.passed}/${s.tests} passados • ${s.duration}ms`,
            id: `test-${s.name}-${Math.random()}`,
          })
        }
      })
    }

    // 2. Search in Reports & Commits
    recentCommits.forEach(c => {
      // Search by report filename
      if (c.reportFile && c.reportFile.toLowerCase().includes(query)) {
        results.push({
          type: 'report',
          title: c.reportFile,
          subtitle: `Snapshot: ${c.hash.substring(0, 7)} • ${c.date}`,
          id: `report-${c.hash}-${Math.random()}`,
          payload: c.reportFile,
        })
      }

      // Search by commit message or hash
      if (
        c.message.toLowerCase().includes(query) ||
        c.hash.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'commit',
          title: c.message,
          subtitle: `Hash: ${c.hash.substring(0, 7)} • Score: ${c.healthScore}% • ${c.date}`,
          id: `commit-${c.hash}-${Math.random()}`,
        })
      }
    })

    // 3. Add file results
    results.push(...fileSearchResults)

    console.log(`[search-context] Found ${results.length} results`)
    return results
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.title.toLowerCase() === query
        const bExact = b.title.toLowerCase() === query
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return 0
      })
      .slice(0, 10)
  }, [query, currentSnapshot, recentCommits, fileSearchResults])

  return (
    <QualityDataContext.Provider
      value={{
        currentSnapshot,
        historicalData,
        recentCommits,
        failedTests,
        isLoading,
        error,
        realLatency,
        refreshData: fetchData,
        runAction,
        isActionRunning,
        searchQuery,
        setSearchQuery,
        consoleState,
        setConsoleOpen,
        reportModalState,
        openReport,
        setReportModalOpen,
        quickActionsOpen,
        setQuickActionsOpen,
        notificationHistory,
        clearNotifications,
        searchResults,
        openFile,
        fileViewerState,
        setFileViewerOpen,
      }}
    >
      {children}
    </QualityDataContext.Provider>
  )
}
