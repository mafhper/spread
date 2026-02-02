import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CanvasControls } from '@/components/toolbar/tabs/CanvasControls'
import { useCardStore } from '@/store/cardStore'
import { useColorExtractor } from '@/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/hooks/useColorExtractor')

describe('CanvasControls Component', () => {
  const mockStore = createMockCardStore()
  const mockExtractColors = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(useColorExtractor).mockReturnValue({
      extractColorsFromImage: mockExtractColors,
      isExtracting: false,
      error: null,
    })
  })

  it('renders correctly', () => {
    render(<CanvasControls />)
    expect(screen.getByText('Área de Trabalho (Canvas)')).toBeDefined()
    expect(screen.getByText('Cores do Fundo')).toBeDefined()
  })

  it('handles preset selection', () => {
    render(<CanvasControls />)
    const storyButton = screen.getByLabelText('Tamanho Story')
    fireEvent.click(storyButton)

    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'canvasSize',
      'width',
      1080
    )
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'canvasSize',
      'height',
      1920
    )
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'canvasSize',
      'preset',
      'story'
    )
  })

  it('handles color changes', () => {
    render(<CanvasControls />)
    const colorInputs = screen.getAllByRole('textbox') // Hex inputs
    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } })

    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg1',
      '#ff0000'
    )
  })

  it('handles gradient angle change', () => {
    render(<CanvasControls />)
    const angleButton = screen.getByLabelText('Ângulo do gradiente: 90deg')
    fireEvent.click(angleButton)

    expect(mockStore.updateField).toHaveBeenCalledWith('gradientStyle', '90deg')
  })

  it('handles pattern change', () => {
    render(<CanvasControls />)
    const dotsButton = screen.getByLabelText('Selecionar padrão: Pontos')
    fireEvent.click(dotsButton)

    expect(mockStore.updateField).toHaveBeenCalledWith('pattern', 'dots')
  })

  it('handles position reset', () => {
    render(<CanvasControls />)
    const resetX = screen.getByLabelText('Resetar posição X')
    fireEvent.click(resetX)

    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'cardPosition',
      'x',
      0
    )
  })

  it('handles global canvas reset', () => {
    render(<CanvasControls />)
    const resetAll = screen.getByText('Resetar Área e Posição')
    fireEvent.click(resetAll)

    expect(mockStore.resetCanvas).toHaveBeenCalled()
  })

  it('handles auto color extraction', async () => {
    // Configura store com imagem para habilitar o botao
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      image: 'test-image.jpg',
    })

    mockExtractColors.mockResolvedValue({
      primary: '#111111',
      secondary: '#222222',
    })

    render(<CanvasControls />)
    const autoButton = screen.getByLabelText('Extrair cores automaticamente')
    fireEvent.click(autoButton)

    expect(mockExtractColors).toHaveBeenCalledWith('test-image.jpg')

    // Aguarda as promessas serem resolvidas
    await vi.waitFor(() => {
      expect(mockStore.updateNestedField).toHaveBeenCalledWith(
        'colors',
        'bg1',
        '#111111'
      )
      expect(mockStore.updateNestedField).toHaveBeenCalledWith(
        'colors',
        'bg2',
        '#222222'
      )
    })
  })

  it('handles color extraction error', async () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      image: 'test-image.jpg',
    })
    const extractionError = new Error('Extraction failed')
    vi.mocked(useColorExtractor).mockReturnValue({
      extractColorsFromImage: vi.fn().mockRejectedValue(extractionError),
      isExtracting: false,
      error: null,
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<CanvasControls />)
    const autoButton = screen.getByLabelText('Extrair cores automaticamente')

    // Fire and wait for the async chain to complete
    fireEvent.click(autoButton)

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao extrair'),
        extractionError
      )
    })
    consoleSpy.mockRestore()
  })

  it('handles range input changes for card position', () => {
    render(<CanvasControls />)
    const sliders = screen.getAllByRole('slider')

    fireEvent.change(sliders[0], { target: { value: '20' } }) // X slider
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'cardPosition',
      'x',
      20
    )

    fireEvent.change(sliders[1], { target: { value: '-10' } }) // Y slider
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'cardPosition',
      'y',
      -10
    )
  })

  it('handles custom background image removal', () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      customBgImage: 'test-bg.jpg',
    })

    render(<CanvasControls />)
    const removeButton = screen.getByLabelText('Remover imagem customizada')
    fireEvent.click(removeButton)

    expect(mockStore.updateField).toHaveBeenCalledWith('customBgImage', null)
  })
})
