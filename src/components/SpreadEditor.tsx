import * as React from 'react'
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { History, RotateCcw } from 'lucide-react'
import { Sidebar } from './toolbar/Sidebar'
import { useCardStore } from '../store/cardStore'
import { fetchMetadata } from '../services/metadata'
import { urlToBase64 } from '../services/exportUtils'
import {
  getPendingUrl,
  setPendingUrl,
  removePendingUrl,
} from '../utils/persistence'
import { useColorExtractor } from '../hooks/useColorExtractor'

// Lazy load heavy components for code splitting
const PreviewSection = lazy(() =>
  import('./preview/PreviewSection').then(m => ({ default: m.PreviewSection }))
)
const LandingPage = lazy(() =>
  import('./landing/LandingPage').then(m => ({ default: m.LandingPage }))
)
const HistoryPanel = lazy(() =>
  import('./history/HistoryPanel').then(m => ({ default: m.HistoryPanel }))
)

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full bg-zinc-950">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
)

export const SpreadEditor: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  const {
    isWelcomeState: isWelcome,
    setFullState,
    updateNestedField,
    updateField,
    resetToDefaults,
  } = useCardStore()
  const { extractColorsFromImage } = useColorExtractor()

  const autoExtractColors = async (imageUrl: string) => {
    try {
      const extracted = await extractColorsFromImage(imageUrl)
      if (extracted) {
        updateNestedField('colors', 'bg1', extracted.primary)
        updateNestedField('colors', 'bg2', extracted.secondary)
        updateField('extractedColors', {
          bg1: extracted.primary,
          bg2: extracted.secondary,
        })
      }
    } catch (error) {
      console.error('[SpreadEditor] Auto color extraction error:', error)
    }
  }

  // Debounce function for localStorage persistence
  const debounce = useCallback(
    <F extends (...args: Parameters<F>) => ReturnType<F>>(
      func: F,
      wait: number
    ) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      return (...args: Parameters<F>) => {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), wait)
      }
    },
    []
  )

  // Restore saved URL from localStorage on mount
  useEffect(() => {
    try {
      const savedUrl = getPendingUrl()
      if (savedUrl) {
        setInputUrl(savedUrl)
        setHasDraft(true)
        console.log('[SpreadEditor - INFO] URL restaurada do localStorage')
      }
    } catch (error) {
      console.error('[SpreadEditor - ERROR] Falha ao restaurar URL:', error)
    }
  }, [])

  // Persist URL to localStorage with debounce
  const persistUrl = useCallback((url: string) => {
    try {
      if (url) {
        setPendingUrl(url)
        setHasDraft(true)
      } else {
        removePendingUrl()
        setHasDraft(false)
      }
    } catch (error) {
      console.error('[SpreadEditor - ERROR] Falha ao salvar URL:', error)
    }
  }, [])

  const debouncedPersistUrl = useCallback(debounce(persistUrl, 300), [
    debounce,
    persistUrl,
  ])

  // Watch inputUrl changes and persist with debounce
  useEffect(() => {
    debouncedPersistUrl(inputUrl)
  }, [inputUrl, debouncedPersistUrl])

  const handleGenerate = async () => {
    if (!inputUrl) return
    setIsLoadingMetadata(true)

    // Reset layout settings for new content
    resetToDefaults()

    try {
      const data = await fetchMetadata(inputUrl)
      if (data) {
        const [base64Favicon, base64Image] = await Promise.all([
          data.favicon ? urlToBase64(data.favicon) : Promise.resolve(null),
          data.image ? urlToBase64(data.image) : Promise.resolve(null),
        ])

        setFullState({
          url: inputUrl,
          title: data.title,
          description: data.description,
          image: base64Image || data.image,
          favicon: base64Favicon || data.favicon,
          domain: data.domain,
          author: data.author || '',
          template: data.template,
          isWelcomeState: false,
          isSidebarOpen: true,
        })

        // Clear saved URL after successful generation
        removePendingUrl()
        setHasDraft(false)
        console.log('[SpreadEditor - INFO] URL salva removida apos geracao')

        if (data.image) await autoExtractColors(base64Image || data.image)
      } else {
        alert('Não foi possível carregar os dados deste link.')
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao buscar link.')
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  // Welcome state: Full Landing Page experience
  if (isWelcome) {
    return (
      <div className="h-screen w-full flex flex-col bg-zinc-950 text-white overflow-hidden">
        {/* Landing Page Content (scrollable) */}
        <div
          id="landing-scroll-container"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative scrollbar-hide"
        >
          {/* LandingPage renders its own HeaderLanding internally */}
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <LandingPage
                inputUrl={inputUrl}
                setInputUrl={setInputUrl}
                onGenerate={handleGenerate}
                isLoading={isLoadingMetadata}
                hasDraft={hasDraft}
              />
            </Suspense>
          </main>
        </div>

        {/* History Panel */}
        {showHistory && (
          <Suspense fallback={null}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </Suspense>
        )}
      </div>
    )
  }

  // Editor state: Card generation UI
  return (
    <div className="h-screen w-full flex bg-black text-[var(--text-main)] overflow-hidden">
      {/* Left Sidebar */}
      <div className="z-30 h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        {/* Header / Top Bar */}
        <header className="flex-shrink-0 px-4 py-3 sm:p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:pl-3 sm:pr-5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:scale-105 active:scale-95 transition-all min-h-[44px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center p-1 sm:p-1.5 shadow-xl">
                <img
                  src="/spread/logo.svg"
                  alt=""
                  className="w-full h-full opacity-95 invert brightness-0"
                />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Spread
              </span>
            </button>

            <a
              href="https://github.com/mafhper/spread"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-white"
              title="Ver no GitHub"
              aria-label="Ver no GitHub"
            >
              <svg
                viewBox="0 0 16 16"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Tem certeza que deseja resetar todas as personalizações?'
                  )
                ) {
                  useCardStore.getState().reset()
                }
              }}
              className="p-2.5 sm:p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 group"
              title="Resetar tudo"
              aria-label="Resetar tudo"
            >
              <RotateCcw
                size={20}
                className="group-hover:rotate-[-45deg] transition-transform"
              />
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="p-2.5 sm:p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)] transition-all min-w-[44px] min-h-[44px] flex items-center gap-2 text-[var(--text-muted)] hover:text-white group"
              title="Histórico"
              aria-label="Histórico"
            >
              <History
                size={20}
                className="group-hover:rotate-[-20deg] transition-transform"
              />
            </button>
          </div>
        </header>

        {/* Main Preview Area */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>
            <PreviewSection />
          </Suspense>
        </main>
      </div>

      {/* History Panel */}
      {showHistory && (
        <Suspense fallback={null}>
          <HistoryPanel onClose={() => setShowHistory(false)} />
        </Suspense>
      )}
    </div>
  )
}
