import { galleryItems, galleryBasePath } from './weddingGallery.js'
import { CANONICAL as CANONICAL_WEDDING } from './weddingSchema.js'
import { buildServiceSchema, buildBreadcrumbSchema } from './serviceSchemaBuilders.js'

const PARENT_ID = `${CANONICAL_WEDDING}#business`
const AREA_SERVED = ['Cần Thơ', 'Vĩnh Long', 'Hậu Giang', 'Sóc Trăng', 'An Giang']
  .map((name) => ({ '@type': 'City', name }))

const PARENT_CRUMB = { label: 'Minh Minh Thúy — Cưới hỏi trọn gói', to: '/tiec-cuoi' }

function photosOf(group, files) {
  return files.map((file) => {
    const item = galleryItems.find((i) => i.file === file && i.group === group)
    return { src: `${galleryBasePath}${item.file}`, alt: item.alt }
  })
}

// Chỉ 2 hạng mục có ảnh thật xác minh được (đối chiếu weddingGallery.js) mới
// lên trang riêng. Rạp cưới, cổng hoa và đội bê tráp chưa có ảnh minh hoạ
// riêng trong kho — chưa lên trang để tránh nội dung mỏng, thiếu bằng chứng.
export const weddingServicePages = [
  {
    slug: 'trang-tri-ban-tho-gia-tien',
    path: '/tiec-cuoi/trang-tri-ban-tho-gia-tien',
    keyword: 'trang trí bàn thờ gia tiên trọn gói Cần Thơ',
    title: 'Trang trí bàn thờ gia tiên trọn gói tại Cần Thơ — Minh Minh Thúy',
    description:
      'Trang trí bàn thờ gia tiên trọn gói tận nhà tại Cần Thơ: backdrop chữ Hỷ, câu đối, hoa tươi, lư đồng, '
      + 'phối màu theo bàn thờ sẵn có của gia đình. Khảo sát tận nơi trước khi báo giá.',
    kicker: 'Lễ gia tiên',
    h1: 'Trang trí bàn thờ gia tiên trọn gói tại Cần Thơ',
    intro: [
      'Bàn thờ gia tiên là phần được nhìn nhiều nhất trong ngày cưới, và cũng là phần cả họ chụp hình cùng — Minh '
        + 'Minh Thúy dựng đối xứng, chỉnh theo đúng bàn thờ sẵn có của từng nhà, không áp một mẫu chung cho mọi gia đình.',
      'Backdrop chữ Hỷ, câu đối, hoa tươi, bộ lư đồng và chân nến phối theo tông màu gia đình chọn. Khảo sát tận '
        + 'nhà trước khi báo giá, dựng xong trước một ngày để sáng hôm sau nhà chỉ việc lo lễ.',
    ],
    includes: [
      'Backdrop chữ Hỷ, câu đối, hoa tươi',
      'Bộ lư đồng, chân nến, mâm trái cây',
      'Phối màu theo bàn thờ gốc, không phá bố cục nhà',
      'Dựng trước một ngày, tháo dỡ sau lễ',
      'Khảo sát tận nhà trước khi báo giá',
    ],
    photos: photosOf('gia-tien', ['congcuoi6.webp', 'congcuoi9.webp', 'congcuoi3.webp']),
    related: { label: 'Xem mâm quả cưới hỏi', to: '/tiec-cuoi/mam-qua-cuoi-hoi' },
    breadcrumb: [PARENT_CRUMB],
    schemaName: 'Trang trí bàn thờ gia tiên',
  },
  {
    slug: 'mam-qua-cuoi-hoi',
    path: '/tiec-cuoi/mam-qua-cuoi-hoi',
    keyword: 'mâm quả cưới hỏi trọn gói Cần Thơ',
    title: 'Mâm quả cưới hỏi trọn gói tại Cần Thơ — Minh Minh Thúy',
    description:
      'Mâm quả cưới hỏi trọn gói tại Cần Thơ: trầu cau, trái cây, bánh phu thê, trà rượu kết tay theo số mâm nhà '
      + 'chọn, kèm đội ngũ bê tráp đồng phục, giao đúng giờ tận nhà.',
    kicker: 'Lễ hỏi',
    h1: 'Mâm quả cưới hỏi trọn gói tại Cần Thơ',
    intro: [
      'Mâm quả kết tay theo đúng số mâm gia đình chọn — trầu cau, trái cây, bánh phu thê, trà rượu — kết trước tại '
        + 'xưởng, giao đúng giờ tận nhà, kèm đội ngũ bê tráp đồng phục nếu nhà cần thêm người.',
      'Có thể kết theo mẫu rồng phượng cho lễ hỏi lớn hoặc mẫu gọn cho lễ hỏi ít mâm — Minh Minh Thúy tư vấn số '
        + 'mâm phù hợp với quy mô hai họ trước khi báo giá.',
    ],
    includes: [
      'Mâm trầu cau, rồng phượng kết tay',
      'Mâm trái cây, bánh phu thê, trà rượu',
      'Đội ngũ bê tráp đồng phục theo yêu cầu',
      'Kết trước tại xưởng, giao đúng giờ tận nhà',
      'Tư vấn số mâm theo quy mô hai họ',
    ],
    photos: photosOf('qua-cuoi-hoi', ['quacuoihoi3.webp', 'quacuoihoi1.webp', 'quacuoihoi7.webp']),
    related: { label: 'Xem trang trí bàn thờ gia tiên', to: '/tiec-cuoi/trang-tri-ban-tho-gia-tien' },
    breadcrumb: [PARENT_CRUMB],
    schemaName: 'Mâm quả cưới hỏi',
  },
]

export function weddingServiceRouteMeta(page) {
  return { title: page.title, description: page.description, canonical: `https://minhminhthuy.io.vn${page.path}` }
}

export function weddingServiceSchemas(page) {
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
