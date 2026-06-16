import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ResponsiveAccordionSection } from '@/components/toolbar/tabs/ResponsiveAccordionSection'

describe('ResponsiveAccordionSection', () => {
  beforeEach(() => {
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('renders content expanded on desktop', () => {
    render(
      <ResponsiveAccordionSection title="Conteúdo" summary="Resumo">
        <div>Detalhes</div>
      </ResponsiveAccordionSection>
    )

    expect(screen.getByText('Detalhes')).toBeInTheDocument()
  })

  it('starts collapsed on mobile when not marked as default open', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(
      <ResponsiveAccordionSection title="Conteúdo" summary="Resumo">
        <div>Detalhes</div>
      </ResponsiveAccordionSection>
    )

    expect(screen.queryByText('Detalhes')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /conteúdo resumo/i }))

    expect(screen.getByText('Detalhes')).toBeInTheDocument()
  })
})
