import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ToneSelector from './ToneSelector.jsx'

const imagesByTone = {
  son: ['son1.jpg', 'son2.jpg', 'son3.jpg'],
  dao: ['dao1.jpg', 'dao2.jpg', 'dao3.jpg'],
  kem: ['kem1.jpg', 'kem2.jpg', 'kem3.jpg'],
  ngoc: ['ngoc1.jpg', 'ngoc2.jpg', 'ngoc3.jpg'],
}

describe('ToneSelector', () => {
  it('defaults to the Son tone', () => {
    render(<ToneSelector imagesByTone={imagesByTone} />)
    expect(screen.getByText('Bộ Sưu Tập Tông Son — Đỏ Son Ấm Cúng')).toBeInTheDocument()
    expect(screen.getByAltText('Bàn Gia Tiên')).toHaveAttribute('src', 'son1.jpg')
  })

  it('switches content and active button when Đào is clicked', () => {
    render(<ToneSelector imagesByTone={imagesByTone} />)
    fireEvent.click(screen.getByRole('button', { name: /Tông Đào/i }))

    expect(screen.getByText('Bộ Sưu Tập Tông Đào — Nude Hồng Nhẹ Nhàng')).toBeInTheDocument()
    expect(screen.getByAltText('Bàn Gia Tiên')).toHaveAttribute('src', 'dao1.jpg')
    expect(screen.getByRole('button', { name: /Tông Đào/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /Tông Son/i })).not.toHaveClass('active')
  })
})
