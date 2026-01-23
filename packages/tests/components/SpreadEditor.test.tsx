// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SpreadEditor } from '../../../src/components/SpreadEditor'
import { useCardStore } from '../../../src/store/cardStore'
import { fetchMetadata } from '../../../src/services/metadata'
import { urlToBase64 } from '../../../src/services/exportUtils'
import { useColorExtractor } from '../../../src/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('../../../src/store/cardStore')
vi.mock('../../../src/services/metadata')
vi.mock('../../../src/services/exportUtils')
vi.mock('../../../src/hooks/useColorExtractor')
vi.mock('../../../src/components/ui/LazyIntersection', () => ({
  LazyIntersection: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
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

  it('renders landing page when in welcome state', () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    // LandingPage elements
    expect(screen.getByRole('heading', { name: /spread/i })).toBeInTheDocument()
  })

  it('renders editor components when not in welcome state', () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /preview/i })).toBeInTheDocument()
  })

  it('toggles history panel when history button is clicked', () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)
    const historyButton = screen.getByRole('button', { name: /histórico/i })

    fireEvent.click(historyButton)
    expect(screen.getByText(/histórico/i)).toBeInTheDocument()
  })

  it('handles URL input and metadata fetch', async () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.jpg',
      favicon: 'https://example.com/favicon.ico',
      domain: 'example.com',
      author: 'Test Author',
      template: 'default' as const,
    }

    vi.mocked(fetchMetadata).mockResolvedValue(mockData)
    vi.mocked(urlToBase64).mockResolvedValue('base64-data')

    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<SpreadEditor />)

    const urlInput = screen.getByPlaceholderText(/cole seu link aqui/i)
    const generateButton = screen.getByRole('button', { name: /gerar/i })

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(generateButton)

    await waitFor(
      () => {
        expect(fetchMetadata).toHaveBeenCalledWith('https://example.com')
        expect(mockStore.setFullState).toHaveBeenCalled()
      },
      { timeout: 3000 }
    )
  })

  it('shows loading state during metadata fetch', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    vi.mocked(fetchMetadata).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                title: '',
                domain: '',
                author: '',
                description: '',
                favicon: '',
                template: 'default' as const,
                image: null,
              }),
            100
          )
        )
    )

    render(<SpreadEditor />)

    const urlInput = screen.getByPlaceholderText(/cole seu link aqui/i)
    const generateButton = screen.getByRole('button', { name: /gerar/i })

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(generateButton)

    expect(generateButton).toHaveAttribute('disabled')
  })

  it('auto-extracts colors when metadata includes image', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockData = {
      title: 'Test Title',
      image: 'https://example.com/image.jpg',
      domain: 'example.com',
      description: '',
      favicon: '',
      author: '',
      template: 'default' as const,
    }

    const mockColors = {
      bg1: '#ff0000',
      bg2: '#00ff00',
      text: '#ffffff',
    }

    vi.mocked(fetchMetadata).mockResolvedValue(mockData)
    vi.mocked(urlToBase64).mockResolvedValue('base64-image')
    mockExtractColorsFromImage.mockResolvedValue(mockColors)

    render(<SpreadEditor />)

    const urlInput = screen.getByPlaceholderText(/cole seu link aqui/i)
    const generateButton = screen.getByRole('button', { name: /gerar/i })

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockExtractColorsFromImage).toHaveBeenCalled()
    })
  })
})
