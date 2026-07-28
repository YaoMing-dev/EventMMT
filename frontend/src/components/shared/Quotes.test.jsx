import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Quotes from './Quotes.jsx'

describe('Quotes', () => {
  it('renders every quote with text, name, and meta', () => {
    render(<Quotes items={[{ text: 'Rất chuyên nghiệp.', name: 'Cô dâu A', meta: 'Bộ sưu tập Son' }]} />)
    expect(screen.getByText('Rất chuyên nghiệp.')).toBeInTheDocument()
    expect(screen.getByText('Cô dâu A')).toBeInTheDocument()
    expect(screen.getByText('Bộ sưu tập Son')).toBeInTheDocument()
  })
})
