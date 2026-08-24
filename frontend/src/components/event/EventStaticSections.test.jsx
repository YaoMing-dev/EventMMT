import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectsList from './ProjectsList.jsx'
import ServicesGrid from './ServicesGrid.jsx'
import Pillars from './Pillars.jsx'

describe('Event static sections', () => {
  it('ProjectsList renders exactly 4 numbered projects', () => {
    render(<ProjectsList />)
    expect(screen.getAllByText(/^0[1-4]$/)).toHaveLength(4)
  })

  it('ServicesGrid renders exactly 3 service cards, each with its static photo', () => {
    render(<ServicesGrid />)
    const cardImages = screen.getAllByRole('img')
    expect(cardImages).toHaveLength(3)
    cardImages.forEach((img) => expect(img.getAttribute('src')).toMatch(/^\/su-kien\//))
  })

  it('Pillars renders exactly 3 pillars', () => {
    render(<Pillars />)
    expect(screen.getAllByText(/^0[1-3]$/)).toHaveLength(3)
  })
})
