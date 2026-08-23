import { useCallback, useEffect, useRef, useState } from 'react'
import {
  galleryBasePath,
  galleryGroups,
  galleryItems,
  countInGroup,
} from '../../data/weddingGallery.js'
import GalleryLightbox from './GalleryLightbox.jsx'
import { contactInfo } from '../../data/contactInfo.js'

const wedding = contactInfo.wedding

export default function WorkGallery() {
  const [nhom, setNhom] = useState('tat-ca')
  const [hien, setHien] = useState(() => new Set())
  const [moTai, setMoTai] = useState(null)
  const luoiRef = useRef(null)

  const dangHien = galleryItems.filter((item) => nhom === 'tat-ca' || item.group === nhom)

  // Hiện dần từng ô ảnh khi cuộn tới.
  useEffect(() => {
    const luoi = luoiRef.current
    if (!luoi) return undefined

    if (
      typeof IntersectionObserver === 'undefined'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setHien(new Set(galleryItems.map((item) => item.file)))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const toi = entries.filter((e) => e.isIntersecting).map((e) => e.target.dataset.anh)
        if (toi.length === 0) return
        entries.forEach((e) => { if (e.isIntersecting) observer.unobserve(e.target) })
        setHien((truoc) => new Set([...truoc, ...toi]))
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    luoi.querySelectorAll('[data-anh]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Đổi bộ lọc thì cả loạt ảnh vừa lộ ra phải hiện ngay, không chờ cuộn.
  function doiNhom(id) {
    setNhom(id)
    const tep = galleryItems
      .filter((item) => id === 'tat-ca' || item.group === id)
      .map((item) => item.file)
    setHien((truoc) => new Set([...truoc, ...tep]))
  }

  const dichChuyen = useCallback((buoc) => {
    setMoTai((vt) => (vt === null ? vt : (vt + buoc + dangHien.length) % dangHien.length))
  }, [dangHien.length])

  const dong = useCallback(() => setMoTai(null), [])

  return (
    <section className="khoi" id="cong-trinh">
      <div className="truc">
        <div className="doi-xung">
          <div className="gach-doi"><span>Công trình đã làm</span></div>
          <h2 className="de">Ảnh công trình của chính mình</h2>
          <p className="de-phu">
            Không dùng ảnh mẫu. Mâm quả chụp tại xưởng lúc vừa kết xong, phần gia tiên
            chụp tại nhà khách ở Cần Thơ và vùng lân cận.
          </p>

          <div className="loc" role="group" aria-label="Lọc theo dịch vụ">
            {galleryGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={nhom === g.id}
                onClick={() => doiNhom(g.id)}
              >
                {g.label} <span>{countInGroup(g.id)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="luoi" ref={luoiRef}>
          {galleryItems.map((item) => {
            const thuoc = nhom === 'tat-ca' || item.group === nhom
            return (
              <figure
                key={item.file}
                data-anh={item.file}
                className={hien.has(item.file) ? 'o-anh hien' : 'o-anh'}
                hidden={!thuoc}
                tabIndex={0}
                role="button"
                aria-label={`Xem lớn: ${item.caption}`}
                onClick={() => setMoTai(dangHien.indexOf(item))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setMoTai(dangHien.indexOf(item))
                  }
                }}
              >
                <img
                  loading="lazy"
                  decoding="async"
                  width={item.w}
                  height={item.h}
                  src={galleryBasePath + item.file}
                  alt={item.alt}
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            )
          })}
        </div>

        <div className="doi-xung" style={{ marginTop: 44 }}>
          <a className="nut" href={`tel:${wedding.phoneIntl}`}>Gọi hỏi mẫu và giá</a>
        </div>
      </div>

      {moTai !== null && (
        <GalleryLightbox items={dangHien} index={moTai} onMove={dichChuyen} onClose={dong} />
      )}
    </section>
  )
}
