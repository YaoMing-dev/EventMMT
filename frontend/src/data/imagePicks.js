export function pickImages(images, indexes) {
  return indexes.map((i) => images[i]?.url)
}

// Event service cards (ServicesGrid) — one representative photo per card.
export const SERVICE_CARD_INDEXES = { nhaBat: 0, khaiTruong: 1, hoiNghi: 2 }
