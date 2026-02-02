import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock dos componentes filhos para teste unitário isolado
vi.mock('@/components/landing/HeaderLanding', () => ({
  HeaderLanding: ({ onHistoryClick }: { onHistoryClick: () => void }) => (
    <header>
      Header Mock
      <button onClick={onHistoryClick} aria-label="Abrir histórico">
        History
      </button>
    </header>
  ),
}))

vi.mock('@/components/history/HistoryPanel', () => ({
  HistoryPanel: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog">
      History Panel
      <button onClick={onClose} aria-label="Fechar histórico">
        Close
      </button>
    </div>
  ),
}))

// Mock LazyIntersection to render children immediately
vi.mock('@/components/ui/LazyIntersection', () => ({
  LazyIntersection: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock SkeletonLoader
vi.mock('@/components/ui/SkeletonLoader', () => ({
  SkeletonLoader: () => <div data-testid="skeleton">Skeleton</div>,
}))

// Mock lazy components
vi.mock('@/components/landing/FeatureGrid', () => ({
  FeatureGrid: () => <div data-testid="feature-grid">Features</div>,
}))
vi.mock('@/components/landing/TechStackSection', () => ({
  TechStackSection: () => <div data-testid="tech-stack">Tech</div>,
}))
vi.mock('@/components/landing/GitHubActivity', () => ({
  GitHubActivity: () => <div data-testid="github-activity">GitHub</div>,
}))
vi.mock('@/components/landing/AboutAuthor', () => ({
  AboutAuthor: () => <div data-testid="about-author">Author</div>,
  default: () => <div data-testid="about-author">Author</div>,
}))
vi.mock('@/components/landing/ProjectsAndFooter', () => ({
  ProjectsAndFooter: () => <div data-testid="projects-footer">Footer</div>,
}))

describe('InfoPage Component', () => {
  it('renders correctly', async () => {
    const { InfoPage } = await import('@/components/landing/InfoPage')
    render(<InfoPage />)

    // Header deve estar presente
    expect(screen.getByText('Header Mock')).toBeDefined()

    // Aguarda lazy load resolver (como LazyIntersection renderiza direto, o Suspense resolve)
    await waitFor(
      () => {
        expect(screen.getByTestId('feature-grid')).toBeDefined()
        expect(screen.getByTestId('tech-stack')).toBeDefined()
        expect(screen.getByTestId('github-activity')).toBeDefined()
        expect(screen.getByTestId('about-author')).toBeDefined()
        expect(screen.getByTestId('projects-footer')).toBeDefined()
      },
      { timeout: 5000 }
    )
  })

  it('toggles history panel', async () => {
    const { InfoPage } = await import('@/components/landing/InfoPage')
    render(<InfoPage />)

    // Inicialmente fechado
    expect(screen.queryByText('History Panel')).toBeNull()

    // Abrir
    const openBtn = screen.getByLabelText('Abrir histórico')
    fireEvent.click(openBtn)
    expect(screen.getByText('History Panel')).toBeDefined()

    // Fechar
    const closeBtn = screen.getByLabelText('Fechar histórico')
    fireEvent.click(closeBtn)
    expect(screen.queryByText('History Panel')).toBeNull()
  })
})
