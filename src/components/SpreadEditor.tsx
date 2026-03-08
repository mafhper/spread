import * as React from 'react'
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Download, History, Loader2, Menu, Zap } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(false)
  const [isCompactToolbar, setIsCompactToolbar] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = React.useRef<
    import('./preview/PreviewSection').PreviewSectionHandle | null
  >(null)

  const {
    isWelcomeState: isWelcome,
    isSidebarOpen,
    url,
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

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth < 768)
      setIsCompactToolbar(window.innerWidth < 1024)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    if (!isWelcome && url) {
      setInputUrl(url)
    }
  }, [isWelcome, url])

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

  const handleOpenHistory = () => {
    updateField('isSidebarOpen', false)
    setShowHistory(true)
  }

  const handleDownloadFromToolbar = async () => {
    if (!previewRef.current) return

    setIsDownloading(true)
    try {
      await previewRef.current.download()
    } finally {
      setIsDownloading(false)
    }
  }

  // Welcome state: Full Landing Page experience
  if (isWelcome) {
    return (
      <div className="min-h-screen h-[100svh] md:h-[100dvh] w-full flex flex-col overflow-hidden bg-zinc-950 text-white">
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
    <div
      className={`min-h-screen h-[100svh] md:h-[100dvh] w-full overflow-hidden bg-black text-[var(--text-main)] ${isMobile ? 'flex flex-col' : 'flex'}`}
    >
      {/* Left Sidebar */}
      <div className={isMobile ? 'order-2 z-30 flex-none' : 'z-30 h-full'}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="order-1 flex-1 flex flex-col relative min-w-0 z-10 min-h-0">
        {/* Header / Top Bar */}
        <header
          className={`flex-shrink-0 z-20 ${isMobile ? 'px-3 py-3' : isCompactToolbar ? 'px-4 py-3 space-y-3' : 'px-6 py-4'}`}
        >
          {isMobile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateField('isSidebarOpen', !isSidebarOpen)}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/80 text-[var(--text-muted)] shadow-lg backdrop-blur-md transition-all hover:bg-[var(--bg-input)] hover:text-white"
                aria-label={
                  isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'
                }
                aria-expanded={isSidebarOpen}
              >
                <Menu size={20} />
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center p-1 sm:p-1.5 shadow-xl">
                  <img
                    src="/spread/logo.svg"
                    alt=""
                    className="w-full h-full opacity-95 invert brightness-0"
                  />
                </div>
              </button>

              <input
                type="url"
                placeholder="Cole seu link aqui..."
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[var(--bg-card)]/80 px-3 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                aria-label="URL do link"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoadingMetadata}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-gray-200 disabled:opacity-50"
                aria-label="Atualizar card"
                title="Atualizar card"
              >
                {isLoadingMetadata ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Zap size={18} className="fill-black" />
                )}
              </button>
              <button
                onClick={handleDownloadFromToolbar}
                disabled={isDownloading}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-gray-200 disabled:opacity-50"
                aria-label="Baixar imagem"
                title="Baixar imagem"
              >
                {isDownloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download size={18} />
                )}
              </button>
              <button
                onClick={handleOpenHistory}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/80 text-[var(--text-muted)] shadow-lg backdrop-blur-md transition-all hover:bg-[var(--bg-input)] hover:text-white"
                title="Histórico"
                aria-label="Histórico"
              >
                <History size={18} />
              </button>
            </div>
          ) : (
            <>
              <div
                className={`flex items-center min-w-0 ${isCompactToolbar ? 'justify-between gap-3' : 'gap-3'}`}
              >
                <div
                  className={`flex items-center min-w-0 ${isCompactToolbar ? 'gap-2 sm:gap-4' : 'flex-none gap-3'}`}
                >
                  <button
                    onClick={() => updateField('isSidebarOpen', !isSidebarOpen)}
                    className="md:hidden p-2.5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-white"
                    aria-label={
                      isSidebarOpen
                        ? 'Fechar menu lateral'
                        : 'Abrir menu lateral'
                    }
                    aria-expanded={isSidebarOpen}
                  >
                    <Menu size={20} />
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)]/80 pl-3 pr-5 min-h-[44px] min-w-0 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center p-1 sm:p-1.5 shadow-xl">
                      <img
                        src="/spread/logo.svg"
                        alt=""
                        className="w-full h-full opacity-95 invert brightness-0"
                      />
                    </div>
                    <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                      Spread
                    </span>
                  </button>
                </div>

                {!isCompactToolbar && (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="url"
                      placeholder="Cole seu link aqui..."
                      value={inputUrl}
                      onChange={e => setInputUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[var(--bg-card)]/80 px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                      aria-label="URL do link"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={isLoadingMetadata}
                      className="min-h-[44px] flex-none rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      aria-label="Atualizar card"
                    >
                      {isLoadingMetadata ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Zap size={18} className="fill-black" />
                          <span>Atualizar card</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadFromToolbar}
                      disabled={isDownloading}
                      className="min-h-[44px] flex-none rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      aria-label="Baixar imagem"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Download size={18} />
                          <span>Baixar imagem</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 ${isCompactToolbar ? 'flex-none' : 'ml-auto flex-none'}`}
                >
                  <button
                    onClick={handleOpenHistory}
                    className="p-2.5 sm:p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)] transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-white"
                    title="Histórico"
                    aria-label="Histórico"
                  >
                    <History size={18} />
                  </button>
                </div>
              </div>

              {!isWelcome && isCompactToolbar && (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Cole seu link aqui..."
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    className="flex-1 min-w-0 rounded-2xl border border-white/10 bg-[var(--bg-card)]/80 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    aria-label="URL do link"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isLoadingMetadata}
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white text-black transition-all hover:bg-gray-200 disabled:opacity-50"
                    aria-label="Atualizar card"
                    title="Atualizar card"
                  >
                    {isLoadingMetadata ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap size={18} className="fill-black" />
                    )}
                  </button>
                  <button
                    onClick={handleDownloadFromToolbar}
                    disabled={isDownloading}
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white text-black transition-all hover:bg-gray-200 disabled:opacity-50"
                    aria-label="Baixar imagem"
                    title="Baixar imagem"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </header>

        {/* Main Preview Area */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>
            <PreviewSection ref={previewRef} />
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
