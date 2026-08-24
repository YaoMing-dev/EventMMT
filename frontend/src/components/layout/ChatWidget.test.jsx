import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ChatWidget from './ChatWidget.jsx'

describe('ChatWidget', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is closed by default and shows the greeting once opened, without calling fetch', () => {
    render(<ChatWidget view="event" />)
    expect(screen.queryByText(/tổ chức sự kiện, khai trương, hội nghị/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    expect(screen.getByText(/tổ chức sự kiện, khai trương, hội nghị/i)).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('sends only the real conversation (not the local greeting) and renders the reply', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'MMT co the ho tro ban.' }) })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Gia thue nha bat bao nhieu?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/chat')
    const body = JSON.parse(options.body)
    expect(body.pageContext).toBe('EVENT')
    expect(body.history).toEqual([{ role: 'user', text: 'Gia thue nha bat bao nhieu?' }])

    expect(await screen.findByText('MMT co the ho tro ban.')).toBeInTheDocument()
  })

  it('maps view="wedding" to pageContext WEDDING', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Da ghi nhan.' }) })
    render(<ChatWidget view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Con lich thang 12 khong?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body.pageContext).toBe('WEDDING')
  })

  it('shows the fallback message when both fetch attempts fail', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ChatWidget view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Con lich khong?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
  })

  it('shows the fallback message when the server responds with a non-ok status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Xin chao' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
  })

  it('retries once automatically if the first attempt fails to connect (backend waking up)', async () => {
    global.fetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Da ket noi lai duoc.' }) })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Xin chao' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Da ket noi lai duoc.')).toBeInTheDocument()
  })

  it('does not send a blank message', () => {
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows a Zalo link alongside the fallback message when the server responds with a non-ok status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })
    render(<ChatWidget view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Xin chao' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
    const zaloLink = screen.getByRole('link', { name: /Nhắn Zalo/i })
    expect(zaloLink).toHaveAttribute('href', 'https://zalo.me/84939050550')
  })

  it('shows a Zalo link alongside the fallback message when both fetch attempts fail (wedding view)', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ChatWidget view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))

    fireEvent.change(screen.getByLabelText(/Nhập câu hỏi cho chatbot/i), { target: { value: 'Con lich khong?' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi/i }))

    expect(await screen.findByText(/hệ thống tư vấn đang bận/i)).toBeInTheDocument()
    const zaloLink = screen.getByRole('link', { name: /Nhắn Zalo/i })
    expect(zaloLink).toHaveAttribute('href', 'https://zalo.me/84907623450')
  })

  it('resets to a fresh greeting when remounted with a different view (simulates event<->wedding navigation)', () => {
    const { rerender } = render(<ChatWidget key="event" view="event" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))
    expect(screen.getByText(/tổ chức sự kiện, khai trương, hội nghị/i)).toBeInTheDocument()

    rerender(<ChatWidget key="wedding" view="wedding" />)
    fireEvent.click(screen.getByRole('button', { name: /Mở chat tư vấn/i }))
    expect(screen.getByText(/Bạn cần hỗ trợ về lễ cưới hỏi nào ạ/i)).toBeInTheDocument()
    expect(screen.queryByText(/tổ chức sự kiện, khai trương, hội nghị/i)).not.toBeInTheDocument()
  })
})
