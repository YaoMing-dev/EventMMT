import { useEffect, useState } from 'react'

export default function Lightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  const current = images[index]

  return (
    <div
      data-testid="lightbox-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <button
        aria-label="Ảnh trước"
        onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length) }}
      >
        ‹ Trước
      </button>
      <img
        src={current.url}
        alt={current.filename}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain' }}
      />
      <button
        aria-label="Ảnh tiếp"
        onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length) }}
      >
        Tiếp ›
      </button>
    </div>
  )
}
