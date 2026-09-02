import { CANONICAL_EVENT } from './eventSchema.js'
import { CANONICAL as CANONICAL_WEDDING } from './weddingSchema.js'

const SITE_URL = 'https://minhminhthuy.io.vn'

// Nguồn sự thật duy nhất cho title/description/canonical mỗi route —
// dùng chung bởi EventSchema/WeddingSchema (lúc chạy JS) và
// scripts/prerender-routes.mjs (lúc build tĩnh), tránh 2 nơi lệch nhau.
export const ROUTES_META = {
  '/': {
    title: 'MMT Event & Wedding — Nhà thầu sự kiện & tiệc cưới miền Tây',
    description:
      'MMT Event & Wedding — nhà thầu tổ chức sự kiện và cưới hỏi trọn gói tại Cần Thơ và các tỉnh miền Tây. '
      + 'Nhà bạt 1.000 khách, âm thanh ánh sáng, trang trí cưới hỏi tận nơi. Báo giá trong 24h.',
    canonical: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/preview.jpg`,
  },
  '/su-kien': {
    title: 'MMT Event — Nhà thầu sự kiện trọn gói tại miền Tây',
    description:
      'Nhà thầu tổ chức sự kiện tại Cần Thơ và miền Tây: nhà bạt sức chứa 1.000 khách, '
      + 'sân khấu, âm thanh ánh sáng. Khai trương, ra quân, hội nghị, mở bán bất động sản. Báo giá trong 24h.',
    canonical: CANONICAL_EVENT,
    ogImage: `${SITE_URL}/preview.jpg`,
  },
  '/tiec-cuoi': {
    title: 'Minh Minh Thúy — Trang trí gia tiên, rạp cưới, cổng hoa tại Cần Thơ',
    description:
      'Trang trí bàn thờ gia tiên, cho thuê rạp cưới, cổng hoa và bàn ghế đãi tiệc tại Cần Thơ. '
      + 'Khảo sát tận nhà, dựng trước ngày cưới, thu dọn sau tiệc.',
    canonical: CANONICAL_WEDDING,
    ogImage: `${SITE_URL}/preview.jpg`,
  },
}
