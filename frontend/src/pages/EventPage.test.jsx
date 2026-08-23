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

  it('links the closing promo to the wedding site, without a sub-brand or price claim', () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Khám phá Minh Minh Thúy/i })).toHaveAttribute('href', '/tiec-cuoi')
    expect(screen.queryByText(/MMT Wedding/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/6,9 triệu/i)).not.toBeInTheDocument()
  })

  it('renders the event brand card with the service list and legal name', () => {
    render(<MemoryRouter><EventPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'MMT Event' })).toBeInTheDocument()
    expect(screen.getByText('Nhà bạt không gian ngoài trời')).toBeInTheDocument()
    expect(screen.getByText(/Công Ty TNHH Dịch Vụ Thương Mại Tổ Chức Sự Kiện MMT/)).toBeInTheDocument()
  })
})
