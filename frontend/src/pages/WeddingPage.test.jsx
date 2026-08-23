import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, afterEach } from 'vitest'
import WeddingPage from './WeddingPage.jsx'
import { galleryItems } from '../data/weddingGallery.js'

function renderPage() {
  return render(<MemoryRouter><WeddingPage /></MemoryRouter>)
}

describe('WeddingPage', () => {
  afterEach(() => {
    document.head.querySelectorAll('[data-mmt="wedding"]').forEach((el) => el.remove())
  })

  it('leads with the Minh Minh Thúy brand, not an MMT sub-brand', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Minh Minh Thúy')
  })

  it('renders all 23 real photos from public/anh with intrinsic dimensions', () => {
    renderPage()
    galleryItems.forEach((item) => {
      const img = screen.getByAltText(item.alt)
      expect(img).toHaveAttribute('src', `/anh/${item.file}`)
      expect(img).toHaveAttribute('width', String(item.w))
      expect(img).toHaveAttribute('height', String(item.h))
    })
  })

  it('filters the gallery by service group', () => {
    renderPage()
    const cong = galleryItems.find((item) => item.group === 'gia-tien')
    const qua = galleryItems.find((item) => item.group === 'qua-cuoi-hoi')

    fireEvent.click(screen.getByRole('button', { name: /Quà cưới hỏi/ }))

    expect(screen.getByAltText(qua.alt).closest('figure')).not.toHaveAttribute('hidden')
    expect(screen.getByAltText(cong.alt).closest('figure')).toHaveAttribute('hidden')
  })

  it('opens the lightbox on a photo and closes it with Escape', () => {
    renderPage()
    const first = galleryItems[0]
    fireEvent.click(screen.getByAltText(first.alt).closest('figure'))

    const khung = screen.getByRole('dialog')
    expect(within(khung).getByText(first.caption)).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the verified NAP on the page', () => {
    renderPage()
    const diaChi = screen.getByText(/162\/24 Trần Ngọc Quế/)
    expect(diaChi).toHaveTextContent('Phường Ninh Kiều, TP Cần Thơ')
    expect(diaChi.textContent).not.toMatch(/Xuân Khánh|quận Ninh Kiều/)
    expect(screen.getAllByRole('link', { name: '0907 623 450' })[0])
      .toHaveAttribute('href', 'tel:+84907623450')
  })

  it('keeps the wedding lead form wired to the shared backend', () => {
    renderPage()
    expect(screen.getByText('Loại lễ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Giữ lịch/i })).toBeInTheDocument()
  })

  it('publishes LocalBusiness JSON-LD without aggregateRating', () => {
    renderPage()
    const the = document.head.querySelector('script[type="application/ld+json"][data-mmt="wedding"]')
    const data = JSON.parse(the.textContent)

    expect(data['@type']).toBe('LocalBusiness')
    expect(data.telephone).toBe('+84907623450')
    expect(data.address.streetAddress).toBe('162/24 Trần Ngọc Quế')
    expect(data.address.addressLocality).toBe('Phường Ninh Kiều')
    expect(data.aggregateRating).toBeUndefined()
    expect(data.review).toBeUndefined()
  })

  it('links the closing promo to the event site', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /Xem mảng sự kiện/i })).toHaveAttribute('href', '/su-kien')
  })
})
