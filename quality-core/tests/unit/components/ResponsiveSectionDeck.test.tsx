import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ResponsiveSectionDeck } from '@/components/toolbar/tabs/ResponsiveSectionDeck'

describe('ResponsiveSectionDeck', () => {
  beforeEach(() => {
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('renders all sections on desktop', () => {
    render(
      <ResponsiveSectionDeck
        sections={[
          {
            id: 'content',
            title: 'Conteúdo',
            summary: 'Resumo',
            content: <div>Detalhes 1</div>,
          },
          {
            id: 'style',
            title: 'Estilo',
            summary: 'Resumo 2',
            content: <div>Detalhes 2</div>,
          },
        ]}
      />
    )

    expect(screen.getByText('Detalhes 1')).toBeInTheDocument()
    expect(screen.getByText('Detalhes 2')).toBeInTheDocument()
  })

  it('shows one active stage at a time on mobile and allows tag navigation', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(
      <ResponsiveSectionDeck
        sections={[
          {
            id: 'content',
            title: 'Conteúdo',
            summary: 'Resumo',
            content: <div>Detalhes 1</div>,
            defaultMobile: true,
          },
          {
            id: 'style',
            title: 'Estilo',
            summary: 'Resumo 2',
            content: <div>Detalhes 2</div>,
          },
        ]}
      />
    )

    expect(screen.getByText('Detalhes 1')).toBeInTheDocument()
    expect(screen.queryByText('Detalhes 2')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Estilo' }))

    expect(screen.getByText('Detalhes 2')).toBeInTheDocument()
    expect(screen.queryByText('Detalhes 1')).not.toBeInTheDocument()
  })
})
