import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../../../../src/components/ui/Card'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Test Content</p>
      </Card>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom classes', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    )
    expect(container.firstChild).toHaveClass('custom-class')
    expect(container.firstChild).toHaveClass('bg-zinc-800') // verifies base class is preserved
  })
})
