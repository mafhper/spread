// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewCard } from '@/components/preview/PreviewCard'
import { useCardStore } from '@/store/cardStore'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/services/iconLibrary')

describe('PreviewCard component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      writable: true,
    })
  })

  it('renders frame mode with overlay text and icon', async () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = false
    mockStore.title = 'Frame Title'
    mockStore.domain = 'youtube.com'
    mockStore.frame = {
      ...mockStore.frame,
      enabled: true,
      showText: true,
      textStyle: {
        position: 'overlay',
        color: '#fff',
        fontSize: 16,
        showIcon: true,
      },
    }

    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const mockIcon = () => <svg data-testid="service-icon" />
    const { getServiceIcon } = await import('@/services/iconLibrary')
    vi.mocked(getServiceIcon).mockReturnValue({
      Icon: mockIcon,
      color: '#fff',
      hasIcon: true,
    })

    render(<PreviewCard />)

    expect(screen.getByText('Frame Title')).toBeInTheDocument()
    expect(screen.getByTestId('service-icon')).toBeInTheDocument()
  })

  it('renders welcome state graphic', () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = true
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewCard />)

    expect(screen.getByAltText(/Spread Logo/i)).toBeInTheDocument()
  })

  it('renders image when provided and not welcome', () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = false
    mockStore.image = 'http://example.com/img.jpg'
    mockStore.layout = { ...mockStore.layout, aspectRatio: 'aspect-auto' }
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewCard />)

    expect(screen.getByAltText('Preview')).toBeInTheDocument()
  })

  it('renders music template with author fallback', () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = false
    mockStore.template = 'music'
    mockStore.title = 'Song'
    mockStore.author = ''
    mockStore.domain = 'spotify.com'
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewCard />)

    expect(screen.getByText('Song')).toBeInTheDocument()
    expect(screen.getByText(/Unknown Artist/i)).toBeInTheDocument()
  })

  it('renders news template with domain', () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = false
    mockStore.template = 'news'
    mockStore.title = 'Headline'
    mockStore.description = 'Desc'
    mockStore.domain = 'example.com'
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    render(<PreviewCard />)

    expect(screen.getByText('Headline')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
  })
})
