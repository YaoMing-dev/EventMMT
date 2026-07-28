import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Header from './Header.jsx'

describe('Header mobile menu', () => {
  it('does not show the mobile menu panel by default', () => {
    render(<MemoryRouter><Header view="event" /></MemoryRouter>)
    expect(screen.getByLabelText('Mở menu')).toBeInTheDocument()
    expect(screen.queryByLabelText('Đóng menu')).not.toBeInTheDocument()
  })

  it('opens the mobile menu with nav links on toggle click', () => {
    render(<MemoryRouter><Header view="event" /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('Mở menu'))

    expect(screen.getByLabelText('Đóng menu')).toBeInTheDocument()
    expect(screen.getAllByText('Dự án').length).toBeGreaterThan(0)
  })

  it('closes the mobile menu after clicking a link', () => {
    render(<MemoryRouter><Header view="event" /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('Mở menu'))
    const projectLinks = screen.getAllByText('Dự án')
    fireEvent.click(projectLinks[projectLinks.length - 1])

    expect(screen.getByLabelText('Mở menu')).toBeInTheDocument()
    expect(screen.queryByLabelText('Đóng menu')).not.toBeInTheDocument()
  })
})
