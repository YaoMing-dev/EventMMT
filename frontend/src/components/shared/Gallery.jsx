import { useEffect, useState } from 'react'
import Lightbox from './Lightbox.jsx'

export default function Gallery({ category }) {
  const [images, setImages] = useState([])
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/images/${category}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (!cancelled) setImages(data) })
      .catch(() => { if (!cancelled) setImages([]) })
    return () => { cancelled = true }
  }, [category])

  if (images.length === 0) {
    return <p>Chưa có ảnh — vui lòng quay lại sau.</p>
  }

  return (
    <>
      <div className="tone-gallery" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {images.map((image, i) => (
          <div className="gal-item" key={image.filename}>
            <img
              src={image.url}
              alt={image.filename}
              loading="lazy"
              onClick={() => setOpenIndex(i)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>
      {openIndex !== null && (
        <Lightbox images={images} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  )
}
