import React, { useState } from 'react'
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
    </div>
  )
}
