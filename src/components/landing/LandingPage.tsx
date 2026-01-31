import React, { useState, Suspense, lazy } from 'react'
import { HeroSection } from './HeroSection'
import { HeaderLanding } from './HeaderLanding'
import { HistoryPanel } from '../history/HistoryPanel'
import { LazyIntersection } from '../ui/LazyIntersection'
import { SkeletonLoader } from '../ui/SkeletonLoader'

// Lazy load below-fold sections to improve TTI
const FeatureGrid = lazy(() =>
  import('./FeatureGrid').then(m => ({ default: m.FeatureGrid }))
)
const TechStackSection = lazy(() =>
  import('./TechStackSection').then(m => ({ default: m.TechStackSection }))
)
const GitHubActivity = lazy(() =>
  import('./GitHubActivity').then(m => ({ default: m.GitHubActivity }))
)
const AboutAuthor = lazy(() =>
  import('./AboutAuthor').then(m => ({ default: m.AboutAuthor }))
)
const ProjectsAndFooter = lazy(() =>
  import('./ProjectsAndFooter').then(m => ({ default: m.ProjectsAndFooter }))
)

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
      <HeaderLanding onHistoryClick={() => setIsHistoryOpen(true)} />

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

      {/* Feature Grid */}
      <LazyIntersection id="recursos" rootMargin="300px" minHeight="600px">
        <section>
          <Suspense fallback={<SkeletonLoader height="600px" />}>
            <FeatureGrid />
          </Suspense>
        </section>
      </LazyIntersection>

      {/* Tech Stack */}
      <LazyIntersection id="tecnologia" rootMargin="200px" minHeight="500px">
        <section>
          <Suspense fallback={<SkeletonLoader height="500px" />}>
            <TechStackSection />
          </Suspense>
        </section>
      </LazyIntersection>

      {/* GitHub Activity */}
      <LazyIntersection id="opensource" rootMargin="200px" minHeight="500px">
        <section>
          <Suspense fallback={<SkeletonLoader height="500px" />}>
            <GitHubActivity />
          </Suspense>
        </section>
      </LazyIntersection>

      {/* About Author */}
      <LazyIntersection id="sobre" rootMargin="200px" minHeight="600px">
        <section>
          <Suspense fallback={<SkeletonLoader height="600px" />}>
            <AboutAuthor />
          </Suspense>
        </section>
      </LazyIntersection>

      {/* Projects and Footer */}
      <LazyIntersection id="projetos" rootMargin="100px" minHeight="800px">
        <section>
          <Suspense fallback={<SkeletonLoader height="800px" />}>
            <ProjectsAndFooter />
          </Suspense>
        </section>
      </LazyIntersection>
    </div>
  )
}
