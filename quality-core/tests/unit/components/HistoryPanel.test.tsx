import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { useHistory } from '@/hooks/useHistory'
import { useCardStore } from '@/store/cardStore'

// Mock hooks
vi.mock('@/hooks/useHistory')
vi.mock('@/store/cardStore')

describe('HistoryPanel Component', () => {
  const mockLoadFromHistory = vi.fn()
  const mockDeleteFromHistory = vi.fn()
  const mockOnClose = vi.fn()
  const mockSetFullState = vi.fn()

  const mockHistoryItems = [
    {
      id: '1',
      url: 'https://test1.com',
      title: 'First Card',
      timestamp: Date.now() - 1000,
      previewImage: 'data:image/png;base64,xxx',
      fullState: { url: 'https://test1.com', title: 'First Card' },
    },
    {
      id: '2',
      url: 'https://test2.com',
      title: 'Second Card',
      timestamp: Date.now(),
      fullState: { url: 'https://test2.com', title: 'Second Card' },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useHistory implementation
    vi.mocked(useHistory).mockReturnValue({
      history: mockHistoryItems,
      loadFromHistory: mockLoadFromHistory,
      deleteFromHistory: mockDeleteFromHistory,
      saveToHistory: vi.fn(),
    })

    // Mock useCardStore implementation
    vi.mocked(useCardStore).mockReturnValue(mockSetFullState)

    // Mock confirm dialog
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    )
  })

  it('renders history items correctly', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    expect(screen.getByText('Histórico')).toBeDefined()
    expect(screen.getByText('2 cards salvos')).toBeDefined()
    expect(screen.getByText('First Card')).toBeDefined()
    expect(screen.getByText('Second Card')).toBeDefined()
    expect(screen.getByText('https://test1.com')).toBeDefined()
  })

  it('shows empty state when no history exists', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      loadFromHistory: mockLoadFromHistory,
      deleteFromHistory: mockDeleteFromHistory,
      saveToHistory: vi.fn(),
    })

    render(<HistoryPanel onClose={mockOnClose} />)

    expect(screen.getByText('Nenhum card salvo ainda.')).toBeDefined()
  })

  it('calls onClose when clicking the backdrop', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    const backdrop = screen.getByLabelText('Fechar histórico')
    fireEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the close button', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    const closeButton = screen.getByLabelText('Fechar painel de histórico')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('loads a card when clicked', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    const firstCard = screen.getByText('First Card')
    fireEvent.click(firstCard)

    expect(mockLoadFromHistory).toHaveBeenCalledWith(mockHistoryItems[0])
    expect(mockSetFullState).toHaveBeenCalledWith({ isWelcomeState: false })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles keyboard navigation (Enter key)', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    const secondCard = screen.getByLabelText('Carregar card: Second Card')
    fireEvent.keyDown(secondCard, { key: 'Enter' })

    expect(mockLoadFromHistory).toHaveBeenCalledWith(mockHistoryItems[1])
  })

  it('deletes a card when clicking the delete button', () => {
    render(<HistoryPanel onClose={mockOnClose} />)

    const deleteButtons = screen.getAllByLabelText(/Excluir/i)
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteFromHistory).toHaveBeenCalledWith('1')
  })

  it('does not delete a card if confirm is cancelled', () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    render(<HistoryPanel onClose={mockOnClose} />)

    const deleteButtons = screen.getAllByLabelText(/Excluir/i)
    fireEvent.click(deleteButtons[0])

    expect(mockDeleteFromHistory).not.toHaveBeenCalled()
  })
})
