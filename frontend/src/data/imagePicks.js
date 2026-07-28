export function pickImages(images, indexes) {
  return indexes.map((i) => images[i]?.url)
}

// Event service cards (ServicesGrid) — one representative photo per card.
export const SERVICE_CARD_INDEXES = { nhaBat: 0, khaiTruong: 1, hoiNghi: 2 }

// Wedding tone gallery (ToneSelector) — picked by position only, since the
// 23 real wedding photos aren't pre-sorted by color tone. Swap these indexes
// once the site owner has reviewed which real photos fit which tone.
export const TONE_IMAGE_INDEXES = {
  son: [0, 1, 2],
  dao: [3, 4, 5],
  kem: [6, 7, 8],
  ngoc: [9, 10, 11],
}
