import React from 'react'
import { HeroSection } from './HeroSection'
import { FeatureGrid } from './FeatureGrid'
import { TechStackSection } from './TechStackSection'
import { GitHubActivity } from './GitHubActivity'
import { AboutAuthor } from './AboutAuthor'
import { ProjectsAndFooter } from './ProjectsAndFooter'
import { LazyIntersection } from '../ui/LazyIntersection'

interface LandingPageProps {
  inputUrl: string
  setInputUrl: (url: string) => void
  onGenerate: () => void
  isLoading: boolean
}

export const LandingPage: React.FC<LandingPageProps> = ({
  inputUrl,
  setInputUrl,
  onGenerate,
  isLoading,
}) => {
  return (
    <main className="w-full" role="main">
      <header>
        <HeroSection
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          onGenerate={onGenerate}
          isLoading={isLoading}
        />
      </header>

      {/* Feature Grid - Higher priority, smaller rootMargin */}
      <LazyIntersection rootMargin="300px" minHeight="600px">
        <FeatureGrid />
      </LazyIntersection>

      {/* Tech Stack */}
      <LazyIntersection rootMargin="200px" minHeight="500px">
        <TechStackSection />
      </LazyIntersection>

      {/* GitHub Activity */}
      <LazyIntersection rootMargin="200px" minHeight="500px">
        <GitHubActivity />
      </LazyIntersection>

      {/* About Author */}
      <LazyIntersection rootMargin="200px" minHeight="600px">
        <AboutAuthor />
      </LazyIntersection>

      {/* Projects and Footer */}
      <LazyIntersection rootMargin="100px" minHeight="800px">
        <ProjectsAndFooter />
      </LazyIntersection>
    </main>
  )
}
