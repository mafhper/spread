import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { MessageSuggestions } from '@/components/toolbar/tabs/MessageSuggestions'
import { useCardStore, type CardState } from '@/store/cardStore'

// Mock card store
vi.mock('@/store/cardStore', () => ({
  useCardStore: vi.fn(),
}))

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
})

describe('MessageSuggestions Component', () => {
  const mockState: Partial<CardState> = {
    url: 'https://youtube.com/watch?v=123',
    title: 'Test Video',
    description: 'Test Description',
    author: 'Test Creator',
    domain: 'youtube.com',
    template: 'default',
    isWelcomeState: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCardStore).mockReturnValue(mockState as CardState)
  })

  it('renders loading/empty state when no URL is present', () => {
    vi.mocked(useCardStore).mockReturnValue({
      ...mockState,
      url: '',
      isWelcomeState: true,
    } as CardState)

    render(<MessageSuggestions />)
    expect(
      screen.getByText('Cole um link para gerar sugestões de mensagens')
    ).toBeDefined()
  })

  it('renders suggestions when a link is processed', async () => {
    render(<MessageSuggestions />)

    // Use findAllByText and check that at least one element exists
    // YouTube appears in multiple places: header, messages, and platform list
    const youtubeElements = await screen.findAllByText(/YouTube/i)
    expect(youtubeElements.length).toBeGreaterThan(0)

    // Check for section title and tone labels
    expect(screen.getByText('Sugestões de Mensagens')).toBeDefined()
    expect(screen.getByText('Casual')).toBeDefined()
    expect(screen.getByText('Animado')).toBeDefined()
  })

  it('handles copy functionality', async () => {
    render(<MessageSuggestions />)

    // Wait for the buttons to appear
    const copyButtons = await screen.findAllByText('Copiar mensagem')
    fireEvent.click(copyButtons[0])

    expect(mockClipboard.writeText).toHaveBeenCalled()
    expect(await screen.findByText('Copiado!')).toBeDefined()

    // Wait for it to disappear
    await waitFor(
      () => {
        expect(screen.queryByText('Copiado!')).toBeNull()
      },
      { timeout: 4000 }
    )
  })

  it('re-generates suggestions when metadata changes', async () => {
    const { rerender } = render(<MessageSuggestions />)

    // Test Video appears in all 3 message suggestions, so use findAllByText
    const testVideoElements = await screen.findAllByText(/Test Video/i)
    expect(testVideoElements.length).toBeGreaterThan(0)

    vi.mocked(useCardStore).mockReturnValue({
      ...mockState,
      title: 'Updated Video Title',
    } as CardState)

    rerender(<MessageSuggestions />)

    // Updated Video Title also appears in all 3 suggestions
    const updatedElements = await screen.findAllByText(/Updated Video Title/i)
    expect(updatedElements.length).toBeGreaterThan(0)
  })
})
