import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import useScrollReveal from './useScrollReveal.js'

let observedElements = []
let intersectionCallback

class FakeIntersectionObserver {
  constructor(callback) {
    intersectionCallback = callback
  }
  observe(el) {
    observedElements.push(el)
  }
  unobserve() {}
  disconnect() {}
}

function TestComponent() {
  useScrollReveal()
  return <div className="rv" data-testid="target">content</div>
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    observedElements = []
    global.IntersectionObserver = FakeIntersectionObserver
  })

  it('observes .rv elements and adds "in" class when intersecting', () => {
    const { getByTestId } = render(<TestComponent />)
    const target = getByTestId('target')

    expect(observedElements).toContain(target)
    expect(target.className).not.toContain('in')

    intersectionCallback([{ target, isIntersecting: true }])

    expect(target.className).toContain('in')
  })
})
