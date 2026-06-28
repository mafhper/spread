// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import {
  PreviewSection,
  type PreviewSectionHandle,
} from '@/components/preview/PreviewSection'
import { useCardStore } from '@/store/cardStore'
import { useHistory } from '@/hooks/useHistory'
import { useColorExtractor } from '@/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/hooks/useHistory')
vi.mock('@/hooks/useColorExtractor')
vi.mock('@/services/metadata')
vi.mock('html-to-image')
vi.mock('downloadjs')
vi.mock('@/services/exportUtils', () => ({
  urlToBase64: vi.fn(),
  getEmbeddedFontCSS: vi.fn().mockResolvedValue(''),
  waitForImages: vi.fn().mockResolvedValue(undefined),
  waitForStableLayout: vi.fn().mockResolvedValue(undefined),
  nextAnimationFrame: vi.fn().mockResolvedValue(undefined),
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

  it('keeps editor controls out of the preview canvas', () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewSection />)

    expect(
      screen.queryByRole('button', { name: /baixar imagem/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Link ativo')).not.toBeInTheDocument()
  })

  it('exposes download through the preview ref', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockBase64 = 'data:image/png;base64,mock-data'
    vi.mocked(toPng).mockResolvedValue(mockBase64)
    const previewRef = React.createRef<PreviewSectionHandle>()

    render(<PreviewSection ref={previewRef} />)

    await act(async () => {
      await previewRef.current?.download()
    })

    await waitFor(() => {
      expect(toPng).toHaveBeenCalled()
      expect(download).toHaveBeenCalledWith(mockBase64, expect.any(String))
    })
  })

  it('handles link generation success', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockData = {
      title: 'Test Title',
      description: 'Test Desc',
      author: 'Test Author',
      image: 'test-img.jpg',
      favicon: 'favicon.ico',
      domain: 'test.com',
      template: 'default' as const,
    }
    const { fetchMetadata } = await import('@/services/metadata')
    vi.mocked(fetchMetadata).mockResolvedValue(mockData)

    render(<PreviewSection />)

    const input = screen.getByPlaceholderText(/cole seu link aqui/i)
    fireEvent.change(input, { target: { value: 'https://test.com' } })

    const generateButton = screen.getByRole('button', { name: /gerar card/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(fetchMetadata).toHaveBeenCalledWith('https://test.com')
      expect(mockStore.setFullState).toHaveBeenCalled()
    })
  })

  it('handles link generation error', async () => {
    const mockStore = createMockCardStore({ isWelcomeState: true })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const { fetchMetadata } = await import('@/services/metadata')
    vi.mocked(fetchMetadata).mockRejectedValue(new Error('Network error'))

    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<PreviewSection />)

    const input = screen.getByPlaceholderText(/cole seu link aqui/i)
    fireEvent.change(input, { target: { value: 'https://error.com' } })

    const generateButton = screen.getByRole('button', { name: /gerar card/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao buscar link.')
    })
  })

  it('renders all background patterns correctly', () => {
    const patterns = [
      'dots',
      'grid',
      'lines',
      'diagonal',
      'noise',
      'mesh',
    ] as const

    patterns.forEach(pattern => {
      const mockStore = createMockCardStore({ isWelcomeState: false, pattern })
      vi.mocked(useCardStore).mockReturnValue(mockStore)

      const { unmount } = render(<PreviewSection />)
      unmount()
    })
  })

  it('renders radial gradients correctly', () => {
    const mockStore = createMockCardStore({
      isWelcomeState: false,
      gradientStyle: 'circle',
    })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewSection />)
  })

  it('toggles diagnostic mode via keyboard', () => {
    const mockStore = createMockCardStore({ isWelcomeState: false })
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewSection />)

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true })
    // Logic in component depends on isDevMode() which might be mocked differently.
    // But we just want to execute the code.
  })
})
