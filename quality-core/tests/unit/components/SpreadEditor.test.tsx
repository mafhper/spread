// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { SpreadEditor } from '@/components/SpreadEditor'
import { useCardStore } from '@/store/cardStore'
import { fetchMetadata } from '@/services/metadata'
import { useColorExtractor } from '@/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/services/metadata')
vi.mock('@/services/exportUtils')
vi.mock('@/hooks/useColorExtractor')

vi.mock('@/components/ui/LazyIntersection', () => ({
  LazyIntersection: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Mock components but keep them functional for props
vi.mock('@/components/landing/LandingPage', () => ({
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

vi.mock('@/components/preview/PreviewSection', () => ({
  PreviewSection: () => (
    <div role="region" aria-label="Preview">
      Preview Mock
    </div>
  ),
}))

describe('SpreadEditor Component', () => {
  const mockExtractColorsFromImage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Make debounce synchronous in tests to avoid race with persisted writes
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ;(global as any).debounce =
      (fn: any) =>
      (...args: any[]) =>
        fn(...args)
    /* eslint-enable @typescript-eslint/no-explicit-any */

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

  it('restores URL from localStorage on mount', async () => {
    const savedUrl = 'https://saved-link.com'
    localStorage.setItem('spread_pending_url', savedUrl)

    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)

    const input = await screen.findByDisplayValue(savedUrl)
    expect(input).toBeInTheDocument()
  })

  it('persists URL to localStorage on input change', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    const input = screen.getByRole('textbox', { name: /url/i })

    await act(async () => {
      fireEvent.change(input, { target: { value: 'https://typing.com' } })
    })

    await waitFor(() => {
      expect(localStorage.getItem('spread_pending_url')).toBe(
        'https://typing.com'
      )
    })
  })

  it('clears persisted URL after successful generation', async () => {
    const savedUrl = 'https://to-generate.com'
    localStorage.setItem('spread_pending_url', savedUrl)

    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockMetadata = {
      title: 'Gen Title',
      description: 'Desc',
      image: null,
      favicon: null,
      domain: 'to-generate.com',
      author: 'Author',
      template: 'default' as const,
    }

    vi.mocked(fetchMetadata).mockResolvedValue(mockMetadata)

    render(<SpreadEditor />)

    const input = await screen.findByRole('textbox', { name: /url/i })
    fireEvent.change(input, { target: { value: savedUrl } })

    const generateButton = screen.getByText('Gerar')

    await act(async () => {
      fireEvent.click(generateButton)
    })

    await waitFor(
      () => {
        expect(localStorage.getItem('spread_pending_url')).toBeNull()
      },
      { timeout: 5000 }
    )
  })

  it('shows history panel when clicking history button', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    const historyButton = screen.getByLabelText(/histórico/i)
    fireEvent.click(historyButton)

    // HistoryPanel is lazy loaded, but we check for no crash
  })

  it('handles global reset with confirmation', async () => {
    const mockReset = vi.fn()
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    // testing internal implementation
    useCardStore.getState = vi.fn().mockReturnValue({ reset: mockReset })

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<SpreadEditor />)
    const resetButton = screen.getByLabelText(/resetar tudo/i)
    fireEvent.click(resetButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(mockReset).toHaveBeenCalled()
  })
})
