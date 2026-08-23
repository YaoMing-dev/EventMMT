import { useEffect, useRef } from 'react'
import { galleryBasePath } from '../../data/weddingGallery.js'

export default function GalleryLightbox({ items, index, onMove, onClose }) {
  const dongRef = useRef(null)
  const item = items[index]

  useEffect(() => {
    const traLai = document.activeElement
    dongRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onMove(-1)
      if (e.key === 'ArrowRight') onMove(1)
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (traLai instanceof HTMLElement) traLai.focus()
    }
  }, [onClose, onMove])

  if (!item) return null

  return (
    <div
      className="khung"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh lớn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button ref={dongRef} className="dong" type="button" aria-label="Đóng" onClick={onClose}>&times;</button>
      <button className="qua lui" type="button" aria-label="Ảnh trước" onClick={() => onMove(-1)}>&lsaquo;</button>
      <img src={galleryBasePath + item.file} alt={item.alt} />
      <button className="qua toi" type="button" aria-label="Ảnh sau" onClick={() => onMove(1)}>&rsaquo;</button>
      <p>{item.caption}</p>
    </div>
  )
}
