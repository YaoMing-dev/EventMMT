import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventBrandCard from './EventBrandCard.jsx'

describe('EventBrandCard', () => {
  it('hides the photo frame when the API has not returned enough images yet', () => {
    render(<EventBrandCard images={[]} />)
    expect(screen.queryByRole('img', { name: '' })).not.toBeInTheDocument()
  })

  it('shows the 4th fetched image so it does not repeat ServicesGrid photos 1-3', () => {
    const images = [
      { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
      { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      { filename: 'c.jpg', url: '/api/images/events/c.jpg' },
      { filename: 'd.jpg', url: '/api/images/events/d.jpg' },
    ]
    render(<EventBrandCard images={images} />)
    expect(screen.getByAltText('d.jpg')).toHaveAttribute('src', '/api/images/events/d.jpg')
  })

  it('does not spill into the wedding brand or B2C service categories', () => {
    render(<EventBrandCard images={[]} />)
    expect(screen.queryByText(/Minh Minh Thúy/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Sinh nhật/)).not.toBeInTheDocument()
  })
})
