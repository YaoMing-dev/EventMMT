import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventSpotlights from './EventSpotlights.jsx'

describe('EventSpotlights', () => {
  it('renders the 2 spotlight cards using facts already published in ProjectsList', () => {
    render(<EventSpotlights images={[]} />)
    expect(screen.getByText('800 khách')).toBeInTheDocument()
    expect(screen.getByText('Mở bán dự án Nam Long')).toBeInTheDocument()
    expect(screen.getByText('Lễ ra quân VNPT Cần Thơ')).toBeInTheDocument()
  })

  it('hides a card photo when the API has not returned that image yet', () => {
    render(<EventSpotlights images={[]} />)
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  it('shows photos at indexes 4-5 so it does not repeat ServicesGrid (0-2) or EventBrandCard (3)', () => {
    const images = Array.from({ length: 6 }, (_, i) => ({
      filename: `${i}.jpg`,
      url: `/api/images/events/${i}.jpg`,
    }))
    render(<EventSpotlights images={images} />)
    expect(screen.getByAltText('4.jpg')).toHaveAttribute('src', '/api/images/events/4.jpg')
    expect(screen.getByAltText('5.jpg')).toHaveAttribute('src', '/api/images/events/5.jpg')
  })
})
