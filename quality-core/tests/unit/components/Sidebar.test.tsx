import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Sidebar } from '@/components/toolbar/Sidebar'
import { useCardStore } from '@/store/cardStore'
import { createMockCardStore } from '../mocks/useCardStore'

vi.mock('@/store/cardStore')

// Mock lazy components using named exports
vi.mock('./tabs/CardTabs', () => ({
  CardTabs: () => <div data-testid="tab-card">CardTabs</div>,
}))
vi.mock('./tabs/MediaTabs', () => ({
  MediaTabs: () => <div data-testid="tab-media">MediaTabs</div>,
}))
vi.mock('./tabs/CanvasControls', () => ({
  CanvasControls: () => <div data-testid="tab-canvas">CanvasControls</div>,
}))
vi.mock('./tabs/TypographyTabs', () => ({
  TypographyTabs: () => <div data-testid="tab-text">TypographyTabs</div>,
}))
vi.mock('./tabs/ColorTabs', () => ({
  ColorTabs: () => <div data-testid="tab-colors">ColorTabs</div>,
}))
vi.mock('./tabs/MessageSuggestions', () => ({
  MessageSuggestions: () => (
    <div data-testid="tab-messages">MessageSuggestions</div>
  ),
}))

describe('Sidebar Component', () => {
  const mockStore = createMockCardStore()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCardStore).mockReturnValue(mockStore)

    // Default window width
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('renders desktop sidebar correctly', () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })
    render(<Sidebar />)
    expect(screen.getByText('Formato')).toBeDefined()
  })

  it('switches tabs correctly', async () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })
    render(<Sidebar />)

    // Switch to Cores and check button state (synchronous)
    const colorsTab = screen.getByLabelText('Cores')
    fireEvent.click(colorsTab)
    expect(colorsTab).toHaveAttribute('aria-selected', 'true')

    // Switch back to Formato
    const formatTab = screen.getByLabelText('Formato')
    fireEvent.click(formatTab)
    expect(formatTab).toHaveAttribute('aria-selected', 'true')
  })

  it('handles sidebar toggle on desktop', () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })
    render(<Sidebar />)
    const toggleButton = screen.getByLabelText(/menu lateral/i)
    fireEvent.click(toggleButton)

    expect(mockStore.updateField).toHaveBeenCalledWith(
      'isSidebarOpen',
      expect.any(Boolean)
    )
  })

  it('handles mobile view correctly', async () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: false,
    })

    const { rerender } = render(<Sidebar />)

    const openButton = screen.getByLabelText('Abrir menu lateral')
    fireEvent.click(openButton)
    expect(mockStore.updateField).toHaveBeenCalledWith('isSidebarOpen', true)

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })
    rerender(<Sidebar />)

    const closeButton = screen.getByLabelText('Fechar menu lateral')
    fireEvent.click(closeButton)
    expect(mockStore.updateField).toHaveBeenCalledWith('isSidebarOpen', false)
  })

  it('handles Escape key on mobile overlay', async () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar />)

    const overlay = await screen.findByRole('presentation')
    fireEvent.keyDown(overlay, { key: 'Escape' })
    expect(mockStore.updateField).toHaveBeenCalledWith('isSidebarOpen', false)
  })

  it('cleans up resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Sidebar />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
