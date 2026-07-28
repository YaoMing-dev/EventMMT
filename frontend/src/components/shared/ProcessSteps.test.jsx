import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProcessSteps from './ProcessSteps.jsx'

describe('ProcessSteps', () => {
  it('renders every step with its number, title, and description', () => {
    render(
      <ProcessSteps
        title={<h2>Bốn bước</h2>}
        steps={[{ no: 'Bước 01', title: 'Khảo sát', desc: 'Xem mặt bằng.' }]}
      />
    )
    expect(screen.getByText('Bốn bước')).toBeInTheDocument()
    expect(screen.getByText('Bước 01')).toBeInTheDocument()
    expect(screen.getByText('Khảo sát')).toBeInTheDocument()
    expect(screen.getByText('Xem mặt bằng.')).toBeInTheDocument()
  })
})
