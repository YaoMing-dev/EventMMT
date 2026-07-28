import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AdminPage from './AdminPage.jsx'

describe('AdminPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends Basic auth header built from the login form and renders the leads table', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ([
        { id: 1, category: 'EVENT', subtype: 'Khai truong', eventDate: '2026-08-01', guestCount: 300, toneColor: null, phone: '0900000001', createdAt: '2026-07-28T00:00:00Z' },
      ]),
    })

    render(<AdminPage />)
    fireEvent.change(screen.getByLabelText(/Tài khoản/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'changeme' } })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/admin/leads')
    expect(options.headers.Authorization).toBe(`Basic ${btoa('admin:changeme')}`)

    expect(await screen.findByText('0900000001')).toBeInTheDocument()
  })

  it('shows an error message on 401', async () => {
    global.fetch.mockResolvedValueOnce({ status: 401 })

    render(<AdminPage />)
    fireEvent.change(screen.getByLabelText(/Tài khoản/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }))

    expect(await screen.findByText(/Sai tài khoản hoặc mật khẩu/i)).toBeInTheDocument()
  })
})
