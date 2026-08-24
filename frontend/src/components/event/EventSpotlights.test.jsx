import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventSpotlights from './EventSpotlights.jsx'
import { quyMoLonAnh, vnptRaQuanAnh } from '../../data/eventGallery.js'

describe('EventSpotlights', () => {
  it('renders the 2 spotlight cards using facts already published in ProjectsList', () => {
    render(<EventSpotlights />)
    expect(screen.getByText('800 khách')).toBeInTheDocument()
    expect(screen.getByText('Mở bán dự án Nam Long')).toBeInTheDocument()
    expect(screen.getByText('Lễ ra quân VNPT Cần Thơ')).toBeInTheDocument()
  })

  it('renders each card with its static photo — no API round-trip needed', () => {
    render(<EventSpotlights />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', quyMoLonAnh.src)
    expect(images[1]).toHaveAttribute('src', vnptRaQuanAnh.src)
  })
})
