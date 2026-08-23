import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PartnerMarquee from './PartnerMarquee.jsx'
import { partners, partnersBasePath } from '../../data/partners.js'

describe('PartnerMarquee', () => {
  it('splits partners into two rows running in opposite directions', () => {
    const { container } = render(<PartnerMarquee />)
    const rows = container.querySelectorAll('.doitac-chay')
    expect(rows).toHaveLength(2)
    expect(rows[0]).not.toHaveClass('nguoc')
    expect(rows[1]).toHaveClass('nguoc')
  })

  it('duplicates each row once for a seamless CSS loop', () => {
    const { container } = render(<PartnerMarquee />)
    const rows = container.querySelectorAll('.doitac-chay')
    const totalLogos = [...rows].reduce((n, row) => n + row.querySelectorAll('.doitac-logo').length, 0)
    expect(totalLogos).toBe(partners.length * 2)
  })

  it('renders every logo file from partners.js with an empty decorative alt', () => {
    const { container } = render(<PartnerMarquee />)
    const srcs = new Set([...container.querySelectorAll('.doitac-logo img')].map((img) => img.getAttribute('src')))
    partners.forEach((p) => expect(srcs.has(partnersBasePath + p.file)).toBe(true))
    container.querySelectorAll('.doitac-logo img').forEach((img) => expect(img).toHaveAttribute('alt', ''))
  })

  it('hides the decorative scrolling rows from screen readers and exposes a plain list instead', () => {
    const { container } = render(<PartnerMarquee />)
    container.querySelectorAll('.doitac-chay').forEach((row) => expect(row).toHaveAttribute('aria-hidden', 'true'))
    expect(container.querySelector('.sr-only').textContent).toBe(partners.map((p) => p.label).join(', '))
  })
})
