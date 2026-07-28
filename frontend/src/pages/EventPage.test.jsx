import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import EventPage from './EventPage.jsx'

describe('EventPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the event contact form variant and fetches event images', async () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)

    expect(screen.getByText('Loại sự kiện')).toBeInTheDocument()
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/images/events'))
  })

  it('links the closing promo to the wedding site', () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Khám phá MMT Wedding/i })).toHaveAttribute('href', '/tiec-cuoi')
  })
})
