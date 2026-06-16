// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { HeadlessArtboard } from '@/components/preview/HeadlessArtboard'
import { useCardStore } from '@/store/cardStore'
import { computeUnifiedExportScale } from '@/utils/exportScale'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/utils/exportScale')
vi.mock('@/components/preview/PreviewCard', () => ({
  PreviewCard: () => <div data-testid="preview-card">PreviewCard</div>,
}))

describe('HeadlessArtboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('renders with auto canvas preset', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'auto',
      width: 0,
      height: 0,
    }
    mockStore.layout = {
      ...mockStore.layout,
      cardAuto: true,
      measuredCardHeight: 360,
    }

    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.preset).toBe('auto')
  })

  it('renders with fixed canvas preset', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'ig-story',
      width: 0,
      height: 0,
    }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.preset).toBe('ig-story')
  })

  it('applies custom background image style', () => {
    const mockStore = createMockCardStore()
    mockStore.customBgImage = 'http://example.com/bg.jpg'
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.customBgImage).toBe('http://example.com/bg.jpg')
  })

  it('applies gradient background when no custom image', () => {
    const mockStore = createMockCardStore()
    mockStore.customBgImage = null
    mockStore.colors = { bg1: '#1a1a2e', bg2: '#16213e', text: '#fff' }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.customBgImage).toBeNull()
  })

  it('renders pattern overlay with dots pattern', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'dots'
    mockStore.patternOpacity = 0.5
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('dots')
  })

  it('renders pattern overlay with grid pattern', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'grid'
    mockStore.patternOpacity = 0.3
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('grid')
  })

  it('renders pattern overlay with diagonal pattern', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'diagonal'
    mockStore.patternOpacity = 0.4
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('diagonal')
  })

  it('renders pattern overlay with lines pattern', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'lines'
    mockStore.patternOpacity = 0.6
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('lines')
  })

  it('renders pattern overlay with noise pattern', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'noise'
    mockStore.patternOpacity = 0.5
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('noise')
  })

  it('renders with no pattern overlay when pattern is none', () => {
    const mockStore = createMockCardStore()
    mockStore.pattern = 'none'
    mockStore.patternOpacity = 0
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.pattern).toBe('none')
  })

  it('applies card position transform', () => {
    const mockStore = createMockCardStore()
    mockStore.cardPosition = { x: 10, y: -5 }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1.2)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.cardPosition.x).toBe(10)
  })

  it('applies radial gradient when gradientStyle contains circle', () => {
    const mockStore = createMockCardStore()
    mockStore.gradientStyle = 'circle at 50% 50%'
    mockStore.colors = { bg1: '#ff0000', bg2: '#0000ff', text: '#fff' }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.gradientStyle).toContain('circle')
  })

  it('applies canvas border radius', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = { ...mockStore.canvasSize, roundness: 20 }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.roundness).toBe(20)
  })

  it('handles custom canvas dimensions', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'custom',
      width: 2560,
      height: 1440,
    }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.width).toBe(2560)
  })

  it('calculates scale correctly with cardAuto enabled', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'auto',
      width: 0,
      height: 0,
    }
    mockStore.layout = {
      ...mockStore.layout,
      cardAuto: true,
      measuredCardHeight: 500,
      padding: 0,
      paddingAuto: false,
    }
    mockStore.viewport = { width: 1200, height: 900 }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1.5)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.layout.cardAuto).toBe(true)
  })

  it('applies padding calculation with padding auto enabled', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'auto',
      width: 0,
      height: 0,
    }
    mockStore.layout = {
      ...mockStore.layout,
      cardAuto: true,
      paddingAuto: true,
      padding: 0,
    }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.layout.paddingAuto).toBe(true)
  })

  it('uses preset dimensions when canvas dimensions are zero', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'twitter',
      width: 0,
      height: 0,
    }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.preset).toBe('twitter')
  })

  it('handles unknown preset with fallback dimensions', () => {
    const mockStore = createMockCardStore()
    mockStore.canvasSize = {
      ...mockStore.canvasSize,
      preset: 'unknown-preset',
      width: 0,
      height: 0,
    }
    vi.mocked(useCardStore).mockReturnValue(mockStore)
    vi.mocked(computeUnifiedExportScale).mockReturnValue(1)
    render(<HeadlessArtboard ref={null} />)
    expect(mockStore.canvasSize.preset).toBe('unknown-preset')
  })
})
