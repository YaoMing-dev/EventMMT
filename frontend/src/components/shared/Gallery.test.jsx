import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Gallery from './Gallery.jsx'

describe('Gallery', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and renders a thumbnail grid', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
        { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      ],
    })

    render(<Gallery category="events" />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/images/events'))
    const thumbs = await screen.findAllByRole('img')
    expect(thumbs).toHaveLength(2)
    expect(thumbs[0]).toHaveAttribute('loading', 'lazy')
  })

  it('opens the Lightbox on thumbnail click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { filename: 'a.jpg', url: '/api/images/events/a.jpg' },
        { filename: 'b.jpg', url: '/api/images/events/b.jpg' },
      ],
    })

    render(<Gallery category="events" />)
    const thumbs = await screen.findAllByRole('img')
    fireEvent.click(thumbs[1])

    expect(screen.getByTestId('lightbox-backdrop')).toBeInTheDocument()
  })

  it('shows a placeholder message when there are no images', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] })

    render(<Gallery category="wedding" />)

    expect(await screen.findByText(/Chưa có ảnh/i)).toBeInTheDocument()
  })
})
