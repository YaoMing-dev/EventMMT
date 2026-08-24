import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventBrandCard from './EventBrandCard.jsx'
import { thuongHieuAnh } from '../../data/eventGallery.js'

describe('EventBrandCard', () => {
  it('renders its static photo — no API round-trip needed', () => {
    render(<EventBrandCard />)
    expect(screen.getByAltText(thuongHieuAnh.alt)).toHaveAttribute('src', thuongHieuAnh.src)
  })

  it('does not spill into the wedding brand or B2C service categories', () => {
    render(<EventBrandCard />)
    expect(screen.queryByText(/Minh Minh Thúy/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Sinh nhật/)).not.toBeInTheDocument()
  })
})
