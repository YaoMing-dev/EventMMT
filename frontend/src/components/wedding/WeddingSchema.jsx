import { useEffect } from 'react'
import { weddingSchema, CANONICAL } from '../../data/weddingSchema.js'

const TITLE = 'Minh Minh Thúy — Trang trí gia tiên, rạp cưới, cổng hoa tại Cần Thơ'
const DESCRIPTION =
  'Trang trí bàn thờ gia tiên, cho thuê rạp cưới, cổng hoa và bàn ghế đãi tiệc tại Cần Thơ. '
  + 'Khảo sát tận nhà, dựng trước ngày cưới, thu dọn sau tiệc.'

function themThe(ten, thuoc, gia) {
  const the = document.createElement(ten)
  Object.entries(thuoc).forEach(([k, v]) => the.setAttribute(k, v))
  if (gia !== undefined) the.textContent = gia
  document.head.appendChild(the)
  return the
}

/**
 * Gắn tiêu đề, mô tả, canonical và JSON-LD vào <head>, rồi gỡ ra khi rời
 * trang — SPA dùng chung một document nên phần head của mảng cưới hỏi không
 * được ở lại trang sự kiện.
 */
export default function WeddingSchema() {
  useEffect(() => {
    const tieuDeCu = document.title
    document.title = TITLE

    const the = [
      themThe('meta', { name: 'description', content: DESCRIPTION, 'data-mmt': 'wedding' }),
      themThe('link', { rel: 'canonical', href: CANONICAL, 'data-mmt': 'wedding' }),
      themThe(
        'script',
        { type: 'application/ld+json', 'data-mmt': 'wedding' },
        JSON.stringify(weddingSchema),
      ),
    ]

    return () => {
      document.title = tieuDeCu
      the.forEach((el) => el.remove())
    }
  }, [])

  return null
}
