import { useEffect } from 'react'
import { eventSchema } from '../../data/eventSchema.js'
import { ROUTES_META } from '../../data/routeMeta.js'
import useRouteMeta from '../../hooks/useRouteMeta.js'

const { title: TITLE, description: DESCRIPTION, canonical: CANONICAL_EVENT } = ROUTES_META['/su-kien']

function themThe(ten, thuoc, gia) {
  const the = document.createElement(ten)
  Object.entries(thuoc).forEach(([k, v]) => the.setAttribute(k, v))
  if (gia !== undefined) the.textContent = gia
  document.head.appendChild(the)
  return the
}

/**
 * Cập nhật title/description/canonical dùng chung, gắn JSON-LD riêng rồi gỡ
 * ra khi rời trang — SPA dùng chung một document nên phần head của mảng sự
 * kiện không được ở lại trang cưới hỏi.
 */
export default function EventSchema() {
  useRouteMeta({ title: TITLE, description: DESCRIPTION, canonical: CANONICAL_EVENT })

  useEffect(() => {
    // Trang có thể đã được prerender kèm sẵn script này — cập nhật nội dung
    // thay vì chèn thêm để tránh 2 JSON-LD trùng nhau.
    const script = document.querySelector('script[data-mmt="event"]')
      ?? themThe('script', { type: 'application/ld+json', 'data-mmt': 'event' })
    script.textContent = JSON.stringify(eventSchema)

    return () => script.remove()
  }, [])

  return null
}
