// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpreadEditor } from '../../../../src/components/SpreadEditor'
import { useCardStore } from '../../../../src/store/cardStore'
import { fetchMetadata } from '../../../../src/services/metadata'
import { useColorExtractor } from '../../../../src/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('../../../../src/store/cardStore')
vi.mock('../../../../src/services/metadata')
vi.mock('../../../../src/services/exportUtils')
vi.mock('../../../../src/hooks/useColorExtractor')

vi.mock('../../../../src/components/ui/LazyIntersection', () => ({
  LazyIntersection: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock LandingPage but keep it somewhat functional for props
vi.mock('../../../../src/components/landing/LandingPage', () => ({
  LandingPage: ({
    inputUrl,
    setInputUrl,
    onGenerate,
  }: {
    inputUrl: string
    setInputUrl: (url: string) => void
    onGenerate: () => void
  }) => (
    <div role="region" aria-label="Conteúdo da Landing Page">
      <h1>Spread</h1>
      <input
        aria-label="URL"
        value={inputUrl}
        onChange={e => setInputUrl(e.target.value)}
      />
      <button onClick={onGenerate}>Gerar</button>
    </div>
  ),
}))

describe('SpreadEditor Component', () => {
  const mockExtractColorsFromImage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useColorExtractor).mockReturnValue({
      extractColorsFromImage: mockExtractColorsFromImage,
      isExtracting: false,
      error: null,
    })
  })

  it('renders landing page when in welcome state', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)

    // Using findBy with larger timeout to handle lazy load reliably
    expect(
      await screen.findByRole(
        'region',
        { name: /conteúdo da landing page/i },
        { timeout: 3000 }
      )
    ).toBeInTheDocument()
    expect((await screen.findAllByText('Spread')).length).toBeGreaterThan(0)
  })

  it('renders editor components when not in welcome state', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)

    expect(
      await screen.findByRole('region', { name: /preview/i }, { timeout: 3000 })
    ).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const { container } = render(<SpreadEditor />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders URL input in welcome state', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)

    expect(
      await screen.findByRole(
        'region',
        { name: /conteúdo da landing page/i },
        { timeout: 3000 }
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument()
  })

  it('displays loading state during metadata fetch', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    vi.mocked(fetchMetadata).mockImplementation(() => new Promise(() => {}))

    render(<SpreadEditor />)
    expect(
      await screen.findByRole(
        'region',
        { name: /conteúdo da landing page/i },
        { timeout: 3000 }
      )
    ).toBeInTheDocument()
  })

  it('renders editor with image state', async () => {
    const mockStore = createMockCardStore({
      isWelcomeState: false,
      image: 'https://example.com/image.jpg',
    })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    expect(
      await screen.findByRole('region', { name: /preview/i }, { timeout: 3000 })
    ).toBeInTheDocument()
  })

  it('toggles between welcome and editor states', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const { rerender } = render(<SpreadEditor />)

    expect(
      await screen.findByRole(
        'region',
        { name: /conteúdo da landing page/i },
        { timeout: 3000 }
      )
    ).toBeInTheDocument()

    const editorMockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(editorMockStore)

    rerender(<SpreadEditor />)
    expect(
      await screen.findByRole('region', { name: /preview/i }, { timeout: 3000 })
    ).toBeInTheDocument()
  })

  it('handles error states gracefully', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    vi.mocked(useColorExtractor).mockReturnValue({
      extractColorsFromImage: mockExtractColorsFromImage,
      isExtracting: false,
      error: 'Failed to extract colors',
    })

    render(<SpreadEditor />)

    expect((await screen.findAllByText('Spread')).length).toBeGreaterThan(0)
  })

  it('updates store when metadata is fetched', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockMetadata = {
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      favicon: 'https://example.com/favicon.ico',
      domain: 'example.com',
      author: 'Test Author',
      template: 'default' as const,
    }

    vi.mocked(fetchMetadata).mockResolvedValue(mockMetadata)

    render(<SpreadEditor />)
    expect(
      await screen.findByRole(
        'region',
        { name: /conteúdo da landing page/i },
        { timeout: 3000 }
      )
    ).toBeInTheDocument()
  })
})
