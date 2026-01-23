/**
 * Spread Editor - Main Application Component
 *
 * Renders either the LandingPage (welcome state) or the Editor (working state).
 * The landing page is a full promotional experience.
 * The editor is the card generation/customization interface.
 */

import React, { useState } from 'react'
import { History } from 'lucide-react'
import { Sidebar } from './toolbar/Sidebar'
import { PreviewSection } from './preview/PreviewSection'
import { HistoryPanel } from './history/HistoryPanel'
import { LandingPage } from './landing/LandingPage'
import { useCardStore } from '../store/cardStore'
import { fetchMetadata } from '../services/metadata'
import { urlToBase64 } from '../services/exportUtils'
import { useColorExtractor } from '../hooks/useColorExtractor'

export const SpreadEditor: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  const {
    isWelcomeState: isWelcome,
    setFullState,
    updateNestedField,
    updateField,
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

  const handleGenerate = async () => {
    if (!inputUrl) return
    setIsLoadingMetadata(true)
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory relative scrollbar-hide">
          {/* Welcome Header (Absolute, scrolls with content) */}
          <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center bg-transparent backdrop-blur-sm sm:bg-zinc-950/80 sm:backdrop-blur-xl border-b border-white/5 sm:border-white/5">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:pl-3 sm:pr-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 min-h-[44px]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center p-1 sm:p-1.5 shadow-xl">
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
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-white/60 hover:text-white"
                title="Ver no GitHub"
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

            <button
              onClick={() => setShowHistory(true)}
              className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center gap-2 text-white/60 hover:text-white group"
              title="Histórico"
            >
              <History
                size={20}
                className="group-hover:rotate-[-20deg] transition-transform"
              />
              <span className="text-xs font-bold uppercase tracking-widest pr-2 hidden md:inline">
                Histórico
              </span>
            </button>
          </header>

          <LandingPage
            inputUrl={inputUrl}
            setInputUrl={setInputUrl}
            onGenerate={handleGenerate}
            isLoading={isLoadingMetadata}
          />
        </div>

        {/* History Panel */}
        {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
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

          <button
            onClick={() => setShowHistory(true)}
            className="p-2.5 sm:p-3 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] shadow-lg hover:bg-[var(--bg-input)] transition-all min-w-[44px] min-h-[44px] flex items-center gap-2 text-[var(--text-muted)] hover:text-white group"
            title="Histórico"
          >
            <History
              size={20}
              className="group-hover:rotate-[-20deg] transition-transform"
            />
          </button>
        </header>

        {/* Main Preview Area */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <PreviewSection />
        </main>
      </div>

      {/* History Panel */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  )
}
