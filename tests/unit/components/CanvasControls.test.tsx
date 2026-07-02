import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CanvasControls } from '@/components/toolbar/tabs/CanvasControls'
import { useCardStore } from '@/store/cardStore'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')

describe('CanvasControls Component', () => {
  const mockStore = createMockCardStore()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('renders the canvas and position sections', () => {
    render(<CanvasControls />)
    expect(screen.getByText('Área de Trabalho (Canvas)')).toBeDefined()
    expect(screen.getByText('Posição do Card')).toBeDefined()
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

  it('collapses the position section on mobile until the user expands it', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(<CanvasControls />)

    expect(screen.queryByLabelText('Resetar posição X')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Posição do Card' }))

    expect(screen.getByLabelText('Resetar posição X')).toBeInTheDocument()
  })
})
