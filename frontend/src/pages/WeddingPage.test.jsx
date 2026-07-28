import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import WeddingPage from './WeddingPage.jsx'

describe('WeddingPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the wedding contact form variant and fetches wedding images', async () => {
    render(<MemoryRouter><WeddingPage /></MemoryRouter>)

    expect(screen.getByText('Loại lễ')).toBeInTheDocument()
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/images/wedding'))
  })

  it('links the closing promo to the event site', () => {
    render(<MemoryRouter><WeddingPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Khám phá MMT Event/i })).toHaveAttribute('href', '/su-kien')
  })
})
