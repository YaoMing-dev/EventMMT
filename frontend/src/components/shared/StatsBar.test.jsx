import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsBar from './StatsBar.jsx'

describe('StatsBar', () => {
  it('renders one stat per item with value and label', () => {
    render(<StatsBar items={[{ value: '10+', label: 'năm thi công' }, { value: '300+', label: 'sự kiện' }]} />)
    expect(screen.getByText('10+')).toBeInTheDocument()
    expect(screen.getByText('năm thi công')).toBeInTheDocument()
    expect(screen.getByText('300+')).toBeInTheDocument()
    expect(screen.getByText('sự kiện')).toBeInTheDocument()
  })
})
