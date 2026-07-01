// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewCard } from '@/components/preview/PreviewCard'
import { useCardStore } from '@/store/cardStore'
import { getServiceIcon } from '@/services/iconLibrary'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')
vi.mock('@/services/iconLibrary')

describe('PreviewCard component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServiceIcon).mockReturnValue({
      Icon: () => <svg data-testid="service-icon" />,
      color: '#ffffff',
      hasIcon: true,
    })
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      writable: true,
    })
  })

  it('ignores persisted legacy frame flags and renders the canonical card', () => {
    const mockStore = createMockCardStore()
    mockStore.isWelcomeState = false
    mockStore.title = 'Frame Title'
    mockStore.description = 'Canonical description'
    mockStore.frame = {
      ...mockStore.frame,
      enabled: true,
      showText: true,
    }

    vi.mocked(useCardStore).mockReturnValue(mockStore)

    const { container } = render(<PreviewCard />)

    expect(screen.getByText('Frame Title')).toBeInTheDocument()
    expect(screen.getByText('Canonical description')).toBeInTheDocument()
    expect(container.querySelector('#previewCard')).toBeInTheDocument()
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
