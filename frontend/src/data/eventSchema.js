import { contactInfo, companyLegalName } from './contactInfo.js'

const event = contactInfo.event
export const CANONICAL_EVENT = 'https://minhminhthuy.io.vn/su-kien'

// LocalBusiness schema cho mảng sự kiện doanh nghiệp.
// Không gắn aggregateRating tự khai — rủi ro manual action từ Google.
export const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${CANONICAL_EVENT}#business`,
  name: event.tagline,
  alternateName: event.brand,
  description:
    'Nhà thầu tổ chức sự kiện trọn gói tại miền Tây: nhà bạt sức chứa 1.000 khách, '
    + 'sân khấu, âm thanh ánh sáng, khai trương, ra quân, hội nghị, mở bán bất động sản.',
  url: CANONICAL_EVENT,
  telephone: event.phoneIntl,
  parentOrganization: { '@type': 'Organization', name: companyLegalName },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cần Thơ',
    addressRegion: 'Cần Thơ',
    addressCountry: 'VN',
  },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '07:30',
    closes: '20:30',
  }],
  areaServed: [
    { '@type': 'City', name: 'Cần Thơ' },
    { '@type': 'AdministrativeArea', name: 'Vĩnh Long' },
    { '@type': 'AdministrativeArea', name: 'Hậu Giang' },
    { '@type': 'AdministrativeArea', name: 'Sóc Trăng' },
    { '@type': 'AdministrativeArea', name: 'An Giang' },
    { '@type': 'AdministrativeArea', name: 'Kiên Giang' },
    { '@type': 'AdministrativeArea', name: 'Đồng Tháp' },
    { '@type': 'AdministrativeArea', name: 'Tiền Giang' },
    { '@type': 'AdministrativeArea', name: 'Bến Tre' },
  ],
  sameAs: [event.facebookUrl],
  makesOffer: [
    'Cho thuê nhà bạt sự kiện',
    'Thiết kế và thi công sân khấu',
    'Cho thuê âm thanh ánh sáng',
    'Tổ chức lễ khai trương',
    'Tổ chức sự kiện ra quân doanh nghiệp',
    'Tổ chức hội nghị, hội thảo',
    'Tổ chức sự kiện mở bán bất động sản',
    'Cho thuê bàn ghế tiệc',
    'Dịch vụ MC sự kiện',
  ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
}
