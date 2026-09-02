import { useEffect } from 'react'
import { weddingSchema } from '../../data/weddingSchema.js'
import { ROUTES_META } from '../../data/routeMeta.js'
import useRouteMeta from '../../hooks/useRouteMeta.js'

const { title: TITLE, description: DESCRIPTION, canonical: CANONICAL } = ROUTES_META['/tiec-cuoi']

function themThe(ten, thuoc, gia) {
  const the = document.createElement(ten)
  Object.entries(thuoc).forEach(([k, v]) => the.setAttribute(k, v))
  if (gia !== undefined) the.textContent = gia
  document.head.appendChild(the)
  return the
}

/**
 * Cập nhật title/description/canonical dùng chung, gắn JSON-LD riêng rồi gỡ
 * ra khi rời trang — SPA dùng chung một document nên phần head của mảng
 * cưới hỏi không được ở lại trang sự kiện.
 */
export default function WeddingSchema() {
  useRouteMeta({ title: TITLE, description: DESCRIPTION, canonical: CANONICAL })

  useEffect(() => {
    // Trang có thể đã được prerender kèm sẵn script này — cập nhật nội dung
    // thay vì chèn thêm để tránh 2 JSON-LD trùng nhau.
    const script = document.querySelector('script[data-mmt="wedding"]')
      ?? themThe('script', { type: 'application/ld+json', 'data-mmt': 'wedding' })
    script.textContent = JSON.stringify(weddingSchema)

    return () => script.remove()
  }, [])

  return null
}
