import React, { useState } from 'react'
import { History } from 'lucide-react'
import { HeroSection } from './HeroSection'
import { HeaderLanding } from './HeaderLanding'
import { HistoryPanel } from '../history/HistoryPanel'

interface LandingPageProps {
  inputUrl: string
  setInputUrl: (url: string) => void
  onGenerate: () => void
  isLoading: boolean
  hasDraft?: boolean
}

export const LandingPage: React.FC<LandingPageProps> = ({
  inputUrl,
  setInputUrl,
  onGenerate,
  isLoading,
  hasDraft = false,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <div className="w-full" role="region" aria-label="Conteúdo da Landing Page">
      {/* Fixed Header with Navigation */}
      <HeaderLanding
        onHistoryClick={() => setIsHistoryOpen(true)}
        noSpacer={true}
        hideBrand={true}
        hideHistoryButton={true}
      />

      {/* History Panel */}
      {isHistoryOpen && (
        <HistoryPanel onClose={() => setIsHistoryOpen(false)} />
      )}

      {/* Hero Section - Critical (Eager) */}
      <section id="home">
        <HeroSection
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          onGenerate={onGenerate}
          isLoading={isLoading}
          hasDraft={hasDraft}
        />
      </section>

      <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="pointer-events-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-950/85 px-5 py-3 text-sm font-medium text-white/75 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 hover:border-violet-400/35 hover:bg-zinc-900/90 hover:text-white"
          aria-label="Abrir histórico"
        >
          <History size={16} />
          <span>Histórico</span>
        </button>
      </div>
    </div>
  )
}
