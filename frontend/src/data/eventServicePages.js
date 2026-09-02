import {
  nhaBatAnh, quyMoLonAnh, khaiTruongAnh, vnptRaQuanAnh, hoiNghiAnh, thuongHieuAnh,
} from './eventGallery.js'
import { CANONICAL_EVENT } from './eventSchema.js'
import { buildServiceSchema, buildBreadcrumbSchema } from './serviceSchemaBuilders.js'

const PARENT_ID = `${CANONICAL_EVENT}#business`
const AREA_SERVED = ['Cần Thơ', 'Vĩnh Long', 'Hậu Giang', 'Sóc Trăng', 'An Giang', 'Kiên Giang']
  .map((name) => ({ '@type': 'City', name }))

const PARENT_CRUMB = { label: 'MMT Event — Sự kiện doanh nghiệp', to: '/su-kien' }

// Chỉ 3 hạng mục có ảnh thật xác minh được (đối chiếu eventGallery.js) mới
// lên trang riêng — tránh trang thin content không có bằng chứng thực tế.
export const eventServicePages = [
  {
    slug: 'nha-bat-su-kien',
    path: '/su-kien/nha-bat-su-kien',
    keyword: 'cho thuê nhà bạt sự kiện Cần Thơ',
    title: 'Cho thuê nhà bạt sự kiện Cần Thơ, đến 1.000 khách — MMT Event',
    description:
      'Cho thuê nhà bạt sự kiện tại Cần Thơ và miền Tây, sức chứa đến 1.000 khách, thi công trong 48 giờ. '
      + 'Che nắng mưa tuyệt đối cho khai trương, mở bán, hội nghị ngoài trời. Khảo sát tận nơi, báo giá trong 24h.',
    kicker: 'Hạ tầng sự kiện',
    h1: 'Cho thuê nhà bạt sự kiện tại Cần Thơ',
    intro: [
      'Nhà bạt là hạng mục thế mạnh đặc trưng của MMT tại miền Tây — dựng cho sự kiện ngoài trời quy mô từ vài trăm '
        + 'đến 1.000 khách, che nắng mưa tuyệt đối cho khai trương, mở bán bất động sản, hội nghị và tiệc doanh nghiệp.',
      'Khung nhà bạt sọc, quạt hơi nước và khu tea break đi kèm, thi công trong 48 giờ. MMT khảo sát mặt bằng thực '
        + 'tế trước khi báo giá — không báo giá qua điện thoại vì mỗi mặt bằng mỗi khác.',
    ],
    includes: [
      'Nhà bạt sọc quy mô đến 1.000 khách',
      'Khung sắt chịu lực, bạt che nắng mưa hai lớp',
      'Quạt hơi nước, khu tea break',
      'Thi công và tháo dỡ trong 48 giờ',
      'Kỹ thuật trực tại chỗ suốt sự kiện',
    ],
    image: nhaBatAnh,
    gallery: [quyMoLonAnh],
    related: { label: 'Xem hội nghị & hội thảo', to: '/su-kien/hoi-nghi-hoi-thao' },
    breadcrumb: [PARENT_CRUMB],
    schemaName: 'Cho thuê nhà bạt sự kiện',
  },
  {
    slug: 'khai-truong-dong-tho-ra-quan',
    path: '/su-kien/khai-truong-dong-tho-ra-quan',
    keyword: 'tổ chức lễ khai trương trọn gói Cần Thơ',
    title: 'Tổ chức lễ khai trương, động thổ, ra quân tại Cần Thơ — MMT Event',
    description:
      'Tổ chức lễ khai trương, động thổ, ra quân trọn gói tại Cần Thơ và miền Tây: sân khấu, backdrop, cổng chào, '
      + 'MC, nghi thức cắt băng, chạy thử toàn bộ trước giờ G. Báo giá trong 24h.',
    kicker: 'Nghi lễ doanh nghiệp',
    h1: 'Tổ chức lễ khai trương, động thổ, ra quân tại Cần Thơ',
    intro: [
      'Kịch bản nghi thức chuẩn doanh nghiệp — sân khấu, backdrop, cổng chào, múa lân, MC dẫn chương trình và nghi '
        + 'thức cắt băng, dựng theo đúng kịch bản khách duyệt trước.',
      'Toàn bộ hạng mục kỹ thuật chạy thử trước giờ G và có người trực suốt buổi lễ — sự kiện không có cơ hội làm lại.',
    ],
    includes: [
      'Sân khấu, backdrop, cổng chào',
      'Múa lân, MC dẫn chương trình',
      'Nghi thức cắt băng khánh thành',
      'Kỹ thuật âm thanh ánh sáng trực suốt buổi lễ',
      'Chạy thử toàn bộ trước giờ khai mạc',
    ],
    image: khaiTruongAnh,
    gallery: [vnptRaQuanAnh],
    related: { label: 'Xem cho thuê nhà bạt sự kiện', to: '/su-kien/nha-bat-su-kien' },
    breadcrumb: [PARENT_CRUMB],
    schemaName: 'Tổ chức lễ khai trương, động thổ, ra quân',
  },
  {
    slug: 'hoi-nghi-hoi-thao',
    path: '/su-kien/hoi-nghi-hoi-thao',
    keyword: 'tổ chức hội nghị hội thảo Cần Thơ',
    title: 'Tổ chức hội nghị, hội thảo tại Cần Thơ — cho thuê thiết bị | MMT Event',
    description:
      'Tổ chức hội nghị, hội thảo trọn gói hoặc cho thuê lẻ thiết bị tại Cần Thơ: âm thanh hội nghị, màn hình LED, '
      + 'bàn ghế đại biểu, giao lắp tận nơi trong ngày. Báo giá trong 24h.',
    kicker: 'Hội nghị & thiết bị',
    h1: 'Tổ chức hội nghị, hội thảo tại Cần Thơ',
    intro: [
      'Trọn gói kỹ thuật cho hội nghị trong nhà lẫn không gian mở, hoặc thuê lẻ từng hạng mục nếu đơn vị đã có '
        + 'sẵn một phần thiết bị.',
      'Âm thanh hội nghị, màn hình LED, bàn ghế đại biểu và khu vực đón tiếp — giao lắp tận nơi trong ngày, kỹ '
        + 'thuật viên trực suốt sự kiện.',
    ],
    includes: [
      'Âm thanh hội nghị, màn hình LED',
      'Bàn ghế đại biểu, khu vực đón tiếp',
      'Giao lắp thiết bị tận nơi trong ngày',
      'Cho thuê lẻ từng hạng mục theo nhu cầu',
      'Kỹ thuật viên trực suốt sự kiện',
    ],
    image: hoiNghiAnh,
    gallery: [thuongHieuAnh],
    related: { label: 'Xem tổ chức lễ khai trương', to: '/su-kien/khai-truong-dong-tho-ra-quan' },
    breadcrumb: [PARENT_CRUMB],
    schemaName: 'Tổ chức hội nghị, hội thảo',
  },
]

export function eventServiceRouteMeta(page) {
  return { title: page.title, description: page.description, canonical: `https://minhminhthuy.io.vn${page.path}` }
}

export function eventServiceSchemas(page) {
  return [
    buildServiceSchema({
      path: page.path,
      name: page.schemaName,
      description: page.description,
      parentBusinessId: PARENT_ID,
      areaServed: AREA_SERVED,
    }),
    buildBreadcrumbSchema([
      { label: 'Trang chủ', to: '/' },
      ...page.breadcrumb,
      { label: page.schemaName, to: page.path },
    ]),
  ]
}
