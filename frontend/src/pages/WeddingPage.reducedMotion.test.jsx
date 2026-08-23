import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import WeddingPage from './WeddingPage.jsx'
import { galleryItems } from '../data/weddingGallery.js'

// Với prefers-reduced-motion, không có hiệu ứng nào chạy — nên nội dung phải
// hiện thẳng. Thiếu nhánh này thì cả trang nằm ở opacity 0: trắng trang, chứ
// không phải "mất hiệu ứng".
describe('WeddingPage khi người dùng tắt hiệu ứng chuyển động', () => {
  let matchMediaGoc

  beforeEach(() => {
    matchMediaGoc = window.matchMedia
    window.matchMedia = (query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    })
  })

  afterEach(() => {
    window.matchMedia = matchMediaGoc
    document.head.querySelectorAll('[data-mmt="wedding"]').forEach((el) => el.remove())
    vi.restoreAllMocks()
  })

  it('hiện thẳng các mốc thời điểm và khối nội dung, không chờ cuộn', () => {
    const { container } = render(<MemoryRouter><WeddingPage /></MemoryRouter>)

    const moc = container.querySelectorAll('.moc')
    const len = container.querySelectorAll('.len')
    expect(moc.length).toBe(5)
    expect(len.length).toBeGreaterThan(0)
    moc.forEach((el) => expect(el.className).toContain('hien'))
    len.forEach((el) => expect(el.className).toContain('hien'))
  })

  it('hiện thẳng cả 23 ô ảnh', () => {
    const { container } = render(<MemoryRouter><WeddingPage /></MemoryRouter>)

    const o = container.querySelectorAll('.o-anh')
    expect(o.length).toBe(galleryItems.length)
    o.forEach((el) => expect(el.className).toContain('hien'))
  })

  it('đẩy vạch vàng lên hết thay vì chạy theo cuộn', () => {
    const { container } = render(<MemoryRouter><WeddingPage /></MemoryRouter>)

    expect(container.querySelector('.moc-boc').style.getPropertyValue('--chay')).toBe('100%')
  })

  it('không gắn stroke-dash lên cổng hoa nên hình vẽ đứng yên, đầy nét', () => {
    render(<MemoryRouter><WeddingPage /></MemoryRouter>)

    const cong = document.querySelector('.cong')
    cong.querySelectorAll('path, line, circle').forEach((net) => {
      expect(net.style.strokeDasharray).toBe('')
      expect(net.style.strokeDashoffset).toBe('')
    })
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
