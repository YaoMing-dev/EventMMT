import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Lightbox from './Lightbox.jsx'

const images = [
  { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
  { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
  { filename: 'c.jpg', url: '/api/images/events/c.jpg' },
]

describe('Lightbox', () => {
  it('shows the image at startIndex and navigates next/prev', () => {
    render(<Lightbox images={images} startIndex={0} onClose={() => {}} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/a.jpg')

    fireEvent.click(screen.getByRole('button', { name: /tiếp/i }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/b.jpg')

    fireEvent.click(screen.getByRole('button', { name: /trước/i }))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/images/events/a.jpg')
  })

  it('calls onClose on Escape and on backdrop click', () => {
    const onClose = vi.fn()
    render(<Lightbox images={images} startIndex={0} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('lightbox-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
