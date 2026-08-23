import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import useScrollReveal from './useScrollReveal.js'

function TestComponent() {
  useScrollReveal()
  return <div className="rv" data-testid="target">content</div>
}

describe('useScrollReveal', () => {
  let rectSpy

  beforeEach(() => {
    window.innerHeight = 800
    rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect')
  })

  afterEach(() => {
    rectSpy.mockRestore()
  })

  it('reveals an element already within the viewport as soon as it mounts', () => {
    rectSpy.mockReturnValue({ top: 100, bottom: 200 })
    const { getByTestId } = render(<TestComponent />)

    expect(getByTestId('target').className).toContain('in')
  })

  it('leaves an off-screen element hidden until scrolling brings it into view', () => {
    rectSpy.mockReturnValue({ top: 2000, bottom: 2100 })
    const { getByTestId } = render(<TestComponent />)
    const target = getByTestId('target')
    expect(target.className).not.toContain('in')

    rectSpy.mockReturnValue({ top: 100, bottom: 200 })
    fireEvent.scroll(window)

    expect(target.className).toContain('in')
  })

  it('does not depend on IntersectionObserver at all', () => {
    const original = global.IntersectionObserver
    delete global.IntersectionObserver
    rectSpy.mockReturnValue({ top: 100, bottom: 200 })

    const { getByTestId } = render(<TestComponent />)
    expect(getByTestId('target').className).toContain('in')

    global.IntersectionObserver = original
  })
})
