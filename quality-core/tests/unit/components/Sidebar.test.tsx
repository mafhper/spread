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
    expect(screen.getByRole('tab', { name: 'Formato' })).toBeInTheDocument()
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

  it('resets the active category from the fixed footer action', () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar />)

    fireEvent.click(screen.getByText('Resetar Formato'))
    expect(mockStore.resetCanvas).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Cores'))
    fireEvent.click(screen.getByText('Resetar Cores'))
    expect(mockStore.resetColors).toHaveBeenCalled()
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

  it('keeps the mobile dock visible when the sheet is closed', async () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: false,
    })

    const { rerender } = render(<Sidebar />)

    expect(screen.queryByLabelText('Fechar menu lateral')).toBeNull()
    expect(screen.getByRole('tab', { name: 'Formato' })).toBeInTheDocument()

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })
    rerender(<Sidebar />)

    const closeButton = screen.getByLabelText('Fechar menu lateral')
    fireEvent.click(closeButton)
    expect(mockStore.updateField).toHaveBeenCalledWith('isSidebarOpen', false)
  })

  it('renders centered icon tabs on mobile', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    tabs.forEach(tab => expect(tab).toHaveClass('justify-center'))
  })

  it('keeps the mobile sheet open on the initial compact render when the store is already open', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar />)

    expect(
      screen.getByLabelText('Barra lateral de personalização')
    ).toBeInTheDocument()
    expect(mockStore.updateField).not.toHaveBeenCalledWith(
      'isSidebarOpen',
      false
    )
  })

  it('sizes the mobile sheet content from the visible viewport height prop', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar mobileViewportHeight={780} />)

    const sheet = screen.getByLabelText('Barra lateral de personalização')
    expect(sheet).toHaveStyle({
      height: '396px',
    })
  })

  it('does not render a mobile overlay over the preview area', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(<Sidebar />)

    expect(screen.queryByRole('presentation')).toBeNull()
  })

  it('reports reserved mobile height for preview spacing', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    const onReservationChange = vi.fn()

    vi.mocked(useCardStore).mockReturnValue({
      ...mockStore,
      isSidebarOpen: true,
    })

    render(
      <Sidebar
        mobileViewportHeight={780}
        onMobileViewportReservationChange={onReservationChange}
      />
    )

    expect(onReservationChange).toHaveBeenCalledWith(484)
  })

  it('cleans up resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Sidebar />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
