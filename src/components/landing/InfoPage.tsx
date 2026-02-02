import React, { useState, useEffect, Suspense, lazy } from 'react'
import { HeaderLanding } from './HeaderLanding'
import { HistoryPanel } from '../history/HistoryPanel'
import { LazyIntersection } from '../ui/LazyIntersection'
import { SkeletonLoader } from '../ui/SkeletonLoader'

// Lazy load heavy sections
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

export const InfoPage: React.FC = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Ensure scroll to hash on mount after a small delay to allow initial render/hydration
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          const offsetTop = element.offsetTop - 80
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          })
        }
      }, 500)
    }
  }, [])

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header com navegação */}
      <HeaderLanding onHistoryClick={() => setIsHistoryOpen(true)} />

      {/* History Panel */}
      {isHistoryOpen && (
        <HistoryPanel onClose={() => setIsHistoryOpen(false)} />
      )}

      <main className="flex-1 w-full">
        {/* Espaçador para o header fixo */}
        <div className="h-4 sm:h-8" />

        {/* Feature Grid - Funções */}
        <LazyIntersection id="recursos" rootMargin="400px" minHeight="700px">
          <section className="min-h-[700px]">
            <Suspense fallback={<SkeletonLoader height="700px" />}>
              <FeatureGrid />
            </Suspense>
          </section>
        </LazyIntersection>

        {/* Tech Stack - Tecnologia */}
        <LazyIntersection id="tecnologia" rootMargin="300px" minHeight="550px">
          <section className="min-h-[550px]">
            <Suspense fallback={<SkeletonLoader height="550px" />}>
              <TechStackSection />
            </Suspense>
          </section>
        </LazyIntersection>

        {/* GitHub Activity - Desenvolvimento */}
        <LazyIntersection id="opensource" rootMargin="200px" minHeight="550px">
          <section className="min-h-[550px]">
            <Suspense fallback={<SkeletonLoader height="550px" />}>
              <GitHubActivity />
            </Suspense>
          </section>
        </LazyIntersection>

        {/* About Author - Autor */}
        <LazyIntersection id="sobre" rootMargin="200px" minHeight="650px">
          <section className="min-h-[650px]">
            <Suspense fallback={<SkeletonLoader height="650px" />}>
              <AboutAuthor />
            </Suspense>
          </section>
        </LazyIntersection>

        {/* Projects and Footer - Projetos */}
        <LazyIntersection id="projetos" rootMargin="100px" minHeight="900px">
          <section className="min-h-[900px]">
            <Suspense fallback={<SkeletonLoader height="900px" />}>
              <ProjectsAndFooter />
            </Suspense>
          </section>
        </LazyIntersection>
      </main>
    </div>
  )
}
