import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ContactForm from './ContactForm.jsx'

describe('ContactForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders event-specific fields for variant="event"', () => {
    render(<ContactForm variant="event" />)
    expect(screen.getByText('Loại sự kiện')).toBeInTheDocument()
    expect(screen.getByText('Số khách (ước tính)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i })).toBeInTheDocument()
  })

  it('renders wedding-specific fields for variant="wedding"', () => {
    render(<ContactForm variant="wedding" />)
    expect(screen.getByText('Loại lễ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Giữ lịch/i })).toBeInTheDocument()
    // Trang cưới hỏi không còn chia theo tông màu
    expect(screen.queryByText('Tông màu yêu thích')).not.toBeInTheDocument()
    expect(screen.queryByText('Số khách (ước tính)')).not.toBeInTheDocument()
  })

  it('shows an inline error and does not call fetch when phone is blank', () => {
    render(<ContactForm variant="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    expect(screen.getByText(/Vui lòng nhập số điện thoại/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows an inline error and does not call fetch when date is blank', () => {
    render(<ContactForm variant="event" />)
    fireEvent.change(screen.getByPlaceholderText(/Để MMT gọi lại tư vấn/i), { target: { value: '0900000001' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    expect(screen.getByText(/Vui lòng chọn ngày dự kiến/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits the correct payload for the event variant', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    render(<ContactForm variant="event" />)

    fireEvent.change(screen.getByLabelText(/Ngày dự kiến/i), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByPlaceholderText(/Để MMT gọi lại tư vấn/i), { target: { value: '0900000001' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/leads')
    const body = JSON.parse(options.body)
    expect(body.category).toBe('EVENT')
    expect(body.phone).toBe('0900000001')
    expect(body.eventDate).toBe('2026-08-01')
    expect(body.email).toBeNull()

    expect(await screen.findByText(/Đã gửi yêu cầu/i)).toBeInTheDocument()
  })

  it('retries once automatically if the first attempt fails to connect (e.g. backend waking up)', async () => {
    global.fetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    render(<ContactForm variant="event" />)

    fireEvent.change(screen.getByLabelText(/Ngày dự kiến/i), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByPlaceholderText(/Để MMT gọi lại tư vấn/i), { target: { value: '0900000001' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/Đã gửi yêu cầu/i)).toBeInTheDocument()
  })

  it('is optional — sends null when left blank, and includes it trimmed when filled in', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    render(<ContactForm variant="wedding" />)

    fireEvent.change(screen.getByLabelText(/Ngày lành dự kiến/i), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getAllByPlaceholderText(/Để MMT gọi lại tư vấn/i)[0], { target: { value: '0900000001' } })
    fireEvent.change(screen.getByPlaceholderText(/Để MMT gửi mail xác nhận/i), { target: { value: '  khach@example.com  ' } })
    fireEvent.click(screen.getByRole('button', { name: /Giữ lịch/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.email).toBe('khach@example.com')
  })

  it('shows the server validation message on a 400 response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ phone: 'So dien thoai khong hop le' }),
    })
    render(<ContactForm variant="wedding" />)

    fireEvent.change(screen.getByLabelText(/Ngày lành dự kiến/i), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getAllByPlaceholderText(/Để MMT gọi lại tư vấn/i)[0], { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Giữ lịch/i }))

    expect(await screen.findByText('So dien thoai khong hop le')).toBeInTheDocument()
  })

  it('shows any unexpected field error returned by the server so nothing fails silently', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ subtype: 'Vui long chon hang muc' }),
    })
    render(<ContactForm variant="event" />)

    fireEvent.change(screen.getByLabelText(/Ngày dự kiến/i), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByPlaceholderText(/Để MMT gọi lại tư vấn/i), { target: { value: '0900000001' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi yêu cầu báo giá/i }))

    expect(await screen.findByText('Vui long chon hang muc')).toBeInTheDocument()
  })
})
