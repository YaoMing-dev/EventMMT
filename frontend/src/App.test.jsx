import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
  })

  it('renders the home gate at /', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText(/SỰ KIỆN DOANH NGHIỆP/i)).toBeInTheDocument()
  })

  it('hides header/topbar on the home gate', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  })

  it('shows header/topbar and sets body view on /su-kien', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    window.history.pushState({}, '', '/su-kien')
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(document.body.dataset.view).toBe('event')
    expect(scrollSpy).toHaveBeenCalledWith(0, 0)
  })

  it('shows header/topbar and sets body view on /tiec-cuoi', () => {
    window.history.pushState({}, '', '/tiec-cuoi')
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(document.body.dataset.view).toBe('wedding')
  })
})
