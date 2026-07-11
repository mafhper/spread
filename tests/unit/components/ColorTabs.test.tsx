import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ColorTabs } from '@/components/toolbar/tabs/ColorTabs'
import { useCardStore } from '@/store/cardStore'
import { useColorExtractor } from '@/hooks/useColorExtractor'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/hooks/useColorExtractor')

describe('ColorTabs Component', () => {
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

  it('renders correctly with current colors', () => {
    render(<ColorTabs />)
    expect(screen.getByLabelText('Cor 1')).toHaveValue('#0f172a')
    expect(screen.getByLabelText('Cor 2')).toHaveValue('#c084fc')
  })

  it('handles manual color changes', () => {
    render(<ColorTabs />)
    const colorInput1 = screen.getByLabelText('Cor 1')
    fireEvent.change(colorInput1, { target: { value: '#ff0000' } })
    fireEvent.blur(colorInput1)
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg1',
      '#ff0000'
    )
  })

  it('uses an in-app color picker instead of the browser native picker', () => {
    const { container } = render(<ColorTabs />)

    expect(container.querySelectorAll('input[type="color"]')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir seletor Cor 1' }))
    expect(screen.getByRole('dialog', { name: 'Seletor Cor 1' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Selecionar Cor 1' })
    ).toBeVisible()
  })

  it('commits a manual color only when a valid hexadecimal value is confirmed', () => {
    render(<ColorTabs />)
    const hexInput1 = screen.getAllByRole('textbox')[0]

    fireEvent.change(hexInput1, { target: { value: '#123' } })
    expect(mockStore.updateNestedField).not.toHaveBeenCalled()

    fireEvent.change(hexInput1, { target: { value: '#123456' } })
    fireEvent.blur(hexInput1)
    expect(mockStore.updateNestedField).toHaveBeenCalledTimes(1)
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg1',
      '#123456'
    )
  })

  it('commits colors picked from the visual color area', () => {
    render(<ColorTabs />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir seletor Cor 1' }))

    const colorPlane = screen.getByRole('button', { name: 'Selecionar Cor 1' })
    vi.spyOn(colorPlane, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    })

    fireEvent.pointerDown(colorPlane, {
      clientX: 50,
      clientY: 50,
      pointerId: 1,
    })
    fireEvent.pointerUp(colorPlane, { clientX: 50, clientY: 50, pointerId: 1 })

    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg1',
      expect.stringMatching(/^#[0-9a-f]{6}$/i)
    )
  })

  it('handles gradient angle selection', () => {
    render(<ColorTabs />)
    const angleButton = screen.getByLabelText('Gradiente: Direita (90deg)')
    fireEvent.click(angleButton)
    expect(mockStore.updateField).toHaveBeenCalledWith('gradientStyle', '90deg')
  })

  it('handles color preset selection', () => {
    render(<ColorTabs />)
    // There are 15 presets. Let's click the first one.
    const firstPreset = screen.getByLabelText(/Preset de cor 1:/)
    fireEvent.click(firstPreset)
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg1',
      '#09090b'
    )
    expect(mockStore.updateNestedField).toHaveBeenCalledWith(
      'colors',
      'bg2',
      '#27272a'
    )
  })

  it('handles auto color extraction', async () => {
    vi.mocked(useCardStore).mockReturnValue({ ...mockStore, image: 'test.jpg' })
    mockExtractColors.mockResolvedValue({
      primary: '#111111',
      secondary: '#222222',
    })

    render(<ColorTabs />)
    const autoButton = screen.getByText('Auto')
    fireEvent.click(autoButton)

    await waitFor(() => {
      expect(mockExtractColors).toHaveBeenCalledWith('test.jpg')
      expect(mockStore.updateNestedField).toHaveBeenCalledWith(
        'colors',
        'bg1',
        '#111111'
      )
    })
  })

  it('is disabled if there is no image', () => {
    vi.mocked(useCardStore).mockReturnValue({ ...mockStore, image: null })

    render(<ColorTabs />)
    const autoButton = screen.getByText('Auto')
    expect(autoButton).toBeDisabled()
  })
})
