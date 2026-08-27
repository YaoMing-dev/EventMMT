import { useEffect } from 'react'
import { eventSchema, CANONICAL_EVENT } from '../../data/eventSchema.js'

const TITLE = 'MMT Event — Nhà thầu sự kiện trọn gói tại miền Tây'
const DESCRIPTION =
  'Nhà thầu tổ chức sự kiện tại Cần Thơ và miền Tây: nhà bạt sức chứa 1.000 khách, '
  + 'sân khấu, âm thanh ánh sáng. Khai trương, ra quân, hội nghị, mở bán bất động sản. Báo giá trong 24h.'

function themThe(ten, thuoc, gia) {
  const the = document.createElement(ten)
  Object.entries(thuoc).forEach(([k, v]) => the.setAttribute(k, v))
  if (gia !== undefined) the.textContent = gia
  document.head.appendChild(the)
  return the
}

/**
 * Gắn tiêu đề, mô tả, canonical và JSON-LD vào <head>, rồi gỡ ra khi rời
 * trang — SPA dùng chung một document nên phần head của mảng sự kiện không
 * được ở lại trang cưới hỏi.
 */
export default function EventSchema() {
  useEffect(() => {
    const tieuDeCu = document.title
    document.title = TITLE

    const the = [
      themThe('meta', { name: 'description', content: DESCRIPTION, 'data-mmt': 'event' }),
      themThe('link', { rel: 'canonical', href: CANONICAL_EVENT, 'data-mmt': 'event' }),
      themThe(
        'script',
        { type: 'application/ld+json', 'data-mmt': 'event' },
        JSON.stringify(eventSchema),
      ),
    ]

    return () => {
      document.title = tieuDeCu
      the.forEach((el) => el.remove())
    }
  }, [])

  return null
}
