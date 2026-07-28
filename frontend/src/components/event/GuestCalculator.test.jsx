import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GuestCalculator from './GuestCalculator.jsx'

describe('GuestCalculator', () => {
  it('defaults to the 500-guest (12m-15m) tier', () => {
    render(<GuestCalculator />)
    expect(screen.getByText('500 Khách')).toBeInTheDocument()
    expect(screen.getByText(/Khẩu độ 12m - 15m/)).toBeInTheDocument()
  })

  it('switches to the small tier at <=300', () => {
    render(<GuestCalculator />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '200' } })
    expect(screen.getByText('200 Khách')).toBeInTheDocument()
    expect(screen.getByText(/Khẩu độ 10m/)).toBeInTheDocument()
    expect(screen.getByText(/Bàn giao trước G-12 giờ/)).toBeInTheDocument()
  })

  it('switches to the large tier above 700', () => {
    render(<GuestCalculator />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '900' } })
    expect(screen.getByText(/Khẩu độ 18m - 20m/)).toBeInTheDocument()
    expect(screen.getByText(/20.000W/)).toBeInTheDocument()
  })
})
