import { describe, it, expect } from 'vitest'
import { pickImages } from './imagePicks.js'

describe('pickImages', () => {
  it('returns URLs at the given indexes', () => {
    const images = [{ url: 'a' }, { url: 'b' }, { url: 'c' }]
    expect(pickImages(images, [0, 2])).toEqual(['a', 'c'])
  })

  it('falls back to undefined when an index is out of range', () => {
    const images = [{ url: 'a' }]
    expect(pickImages(images, [0, 5])).toEqual(['a', undefined])
  })

  it('returns an empty array when given no images', () => {
    expect(pickImages([], [0, 1, 2])).toEqual([undefined, undefined, undefined])
  })
})
