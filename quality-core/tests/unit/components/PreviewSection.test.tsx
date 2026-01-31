// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { PreviewSection } from '../../../../src/components/preview/PreviewSection'
import { useCardStore } from '../../../../src/store/cardStore'
import { useHistory } from '../../../../src/hooks/useHistory'
import { useColorExtractor } from '../../../../src/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('../../../../src/store/cardStore')
vi.mock('../../../../src/hooks/useHistory')
vi.mock('../../../../src/hooks/useColorExtractor')
vi.mock('../../../../src/services/metadata')
vi.mock('html-to-image')
vi.mock('downloadjs')
vi.mock('../../../../src/services/exportUtils', () => ({
  urlToBase64: vi.fn(),
  getEmbeddedFontCSS: vi.fn().mockResolvedValue(''),
}))

describe('PreviewSection Component', () => {
  const mockSaveToHistory = vi.fn()
  const mockLoadFromHistory = vi.fn()
  const mockExtractColorsFromImage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useHistory).mockReturnValue({
      saveToHistory: mockSaveToHistory,
      history: [],
      loadFromHistory: mockLoadFromHistory,
      deleteFromHistory: vi.fn(),
    })

    vi.mocked(useColorExtractor).mockReturnValue({
      extractColorsFromImage: mockExtractColorsFromImage,
      isExtracting: false,
      error: null,
    })

    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      writable: true,
    })
  })

  it('renders welcome card when in welcome state', () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewSection />)
    expect(
      screen.getByPlaceholderText(/cole seu link aqui/i)
    ).toBeInTheDocument()
  })

  it('renders preview card when not in welcome state', () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewSection />)
    expect(screen.getByRole('region', { name: /preview/i })).toBeInTheDocument()
  })

  it('handles download button click', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockBase64 = 'data:image/png;base64,mock-data'
    vi.mocked(toPng).mockResolvedValue(mockBase64)

    render(<PreviewSection />)

    const downloadButton = screen.getByRole('button', {
      name: /baixar imagem/i,
    })
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(toPng).toHaveBeenCalled()
      expect(download).toHaveBeenCalledWith(mockBase64, expect.any(String))
    })
  })

  it('shows loading state during generation', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    vi.mocked(toPng).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(''), 100))
    )

    render(<PreviewSection />)

    const downloadButton = screen.getByRole('button', {
      name: /baixar imagem/i,
    })
    fireEvent.click(downloadButton)

    expect(screen.getByText(/gerando/i)).toBeInTheDocument()
  })
})
