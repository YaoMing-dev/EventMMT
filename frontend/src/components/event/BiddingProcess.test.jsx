import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BiddingProcess from './BiddingProcess.jsx'

describe('BiddingProcess', () => {
  it('renders exactly 3 steps', () => {
    render(<BiddingProcess />)
    expect(screen.getAllByText(/^0[1-3]$/)).toHaveLength(3)
  })

  it('names the tender/quote/large-scale-support steps', () => {
    render(<BiddingProcess />)
    expect(screen.getByText('Tiếp nhận hồ sơ mời thầu')).toBeInTheDocument()
    expect(screen.getByText('Báo giá cạnh tranh, bóc tách hạng mục')).toBeInTheDocument()
    expect(screen.getByText('Hỗ trợ giá cho sự kiện quy mô lớn')).toBeInTheDocument()
  })

  it('does not invent specific discount percentages or thresholds', () => {
    render(<BiddingProcess />)
    const text = document.body.textContent
    expect(text).not.toMatch(/%/)
  })
})
